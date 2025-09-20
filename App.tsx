import React, { useState, useCallback, useEffect } from 'react';
import { LinkItem } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddLinkModal from './components/AddLinkModal';
import SettingsPage from './components/SettingsPage';
import { useTheme } from './hooks/useTheme';

interface AppData {
  appName: string;
  links: LinkItem[];
}

function App() {
  useTheme(); // Initialize theme hook to set the theme on load
  const [appData, setAppData] = useState<AppData>({ appName: 'Service Dashboard', links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [creationType, setCreationType] = useState<'link' | 'service'>('link');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/data');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch data from server.');
      }
      const data: AppData = await response.json();
      setAppData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (appData?.appName) {
      document.title = appData.appName;
    }
  }, [appData?.appName]);
  
  const handleUpdateLink = useCallback(async (updatedLink: LinkItem) => {
    try {
        const response = await fetch(`/api/links/${updatedLink.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedLink),
        });
        if (!response.ok) throw new Error('Failed to update link');
        const savedLink = await response.json();
        setAppData(prevData => ({
            ...prevData,
            links: prevData.links.map(link => link.id === savedLink.id ? savedLink : link),
        }));
        setEditingLink(null);
    } catch (err) {
        console.error("Update error:", err);
    }
  }, []);

  const handleDeleteLink = useCallback(async (id: string) => {
    try {
        const response = await fetch(`/api/links/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete link');
        setAppData(prevData => ({
            ...prevData,
            links: prevData.links.filter(link => link.id !== id),
        }));
    } catch (err) {
        console.error("Delete error:", err);
    }
  }, []);

  const handleToggleLink = useCallback(async (id: string) => {
    const linkToToggle = appData.links.find(link => link.id === id);
    if (linkToToggle) {
        await handleUpdateLink({ ...linkToToggle, enabled: !linkToToggle.enabled });
    }
  }, [appData.links, handleUpdateLink]);

  const handleAppNameChange = useCallback(async (name: string) => {
    setAppData(prevData => ({ ...prevData, appName: name }));
    try {
        const response = await fetch('/api/settings/appName', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName: name }),
        });
        if (!response.ok) throw new Error('Failed to update app name');
    } catch (err) {
        console.error("App name update error:", err);
        // Optionally revert if API call fails
        fetchData(); 
    }
  }, [fetchData]);

  const openAddModal = (type: 'link' | 'service') => {
    setEditingLink(null);
    setCreationType(type);
    setIsModalOpen(true);
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  const handleSaveLink = async (linkData: Omit<LinkItem, 'id'>) => {
    if (editingLink) {
      await handleUpdateLink({ ...editingLink, ...linkData });
    } else {
       // Since this is a new link, we can add it via the batch endpoint.
       // The server will assign a final ID.
       const newLink = { ...linkData, id: crypto.randomUUID() };
       try {
            const response = await fetch('/api/links/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([newLink]),
            });
            if (!response.ok) throw new Error('Failed to add new link');
            const addedLinks = await response.json();
            setAppData(prev => ({...prev, links: [...prev.links, ...addedLinks]}));
       } catch(err) {
            console.error("Save new link error:", err);
       }
    }
    closeModal();
  };

  const handleAddParsedLinks = useCallback(async (parsedLinks: Omit<LinkItem, 'id' | 'type' | 'proxyConfig' | 'enabled' | 'category'>[]) => {
      const existingUrls = new Set(appData.links.map(l => l.url));
      const newUniqueLinks = parsedLinks
          .filter(pl => !existingUrls.has(pl.url))
          .map(pl => ({
              ...pl, 
              id: crypto.randomUUID(), 
              type: 'service' as const,
              enabled: true,
              category: 'Imported',
              proxyConfig: {
                  target: 'http://localhost:8000',
                  enableSsl: false,
                  sslCertPath: '',
                  sslKeyPath: '',
                  enableWebSockets: false,
              }
          }));
        
      if (newUniqueLinks.length > 0) {
        try {
            const response = await fetch('/api/links/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUniqueLinks)
            });
            if (!response.ok) throw new Error('Failed to add parsed links');
            const addedLinks = await response.json();
            setAppData(prev => ({...prev, links: [...prev.links, ...addedLinks]}));
        } catch(err) {
            console.error("Add parsed links error:", err);
        }
      }
      setView('dashboard'); 
  }, [appData.links]);

  const filteredLinks = appData.links.filter(link => {
    const query = searchQuery.toLowerCase();
    return (
      link.title.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query) ||
      link.description.toLowerCase().includes(query) ||
      (link.category && link.category.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return <div className="min-h-screen bg-[--bg-primary] text-[--text-primary] flex items-center justify-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-red-900/20 text-red-300 p-8">
      <h2 className="text-2xl font-bold mb-4">Error loading dashboard</h2>
      <p>Could not connect to the backend server. Please ensure the server is running by executing <code className="bg-black/50 px-2 py-1 rounded">npm start</code> in your terminal.</p>
      <pre className="mt-4 bg-black/50 p-4 rounded-lg text-sm whitespace-pre-wrap">{error}</pre>
      <button onClick={fetchData} className="mt-6 px-4 py-2 bg-cyan-500 rounded-lg">Retry Connection</button>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[--bg-primary] text-[--text-primary] font-sans">
      <Header 
        appName={appData.appName}
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSettingsClick={() => setView('settings')}
      />
      <main className="container mx-auto p-4 md:p-8">
        {view === 'dashboard' ? (
            <Dashboard 
                links={filteredLinks} 
                onUpdate={handleUpdateLink}
                searchQuery={searchQuery}
            />
        ) : (
            <SettingsPage 
                appName={appData.appName}
                onAppNameChange={handleAppNameChange}
                links={appData.links}
                onBack={() => setView('dashboard')}
                onAddLinks={handleAddParsedLinks}
                onOpenAddModal={openAddModal}
                onEditLink={openEditModal}
                onDeleteLink={handleDeleteLink}
                onToggleLink={handleToggleLink}
            />
        )}
      </main>
      {isModalOpen && (
        <AddLinkModal 
            isOpen={isModalOpen}
            onClose={closeModal}
            onSave={handleSaveLink}
            link={editingLink}
            creationType={creationType}
        />
      )}
    </div>
  );
}

export default App;