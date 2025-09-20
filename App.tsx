import React, { useState, useCallback, useEffect, useRef } from 'react';
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

const ConnectionError: React.FC<{ onRetry: () => void; error: string }> = ({ onRetry, error }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-3xl font-bold text-red-400">Error loading dashboard</h1>
        <p className="mt-2 text-[--text-secondary]">
            Could not connect to the backend server. Please ensure the server is running.
        </p>
        <p className="mt-4 p-4 text-left bg-[--bg-secondary] rounded-lg font-mono text-sm text-red-400 border border-[--border-primary]">
            {error}
        </p>
        <button
            onClick={onRetry}
            className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
            Retry Connection
        </button>
    </div>
);

const LoadingState: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-cyan-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-[--text-secondary]">Loading Dashboard...</p>
        </div>
    </div>
);


function App() {
  useTheme();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [creationType, setCreationType] = useState<'link' | 'service'>('link');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');

  const isInitialLoad = useRef(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setAppData(data);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isInitialLoad.current) {
        if (!isLoading) {
            isInitialLoad.current = false;
        }
        return;
    }

    if (appData) {
        fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData),
        }).catch(err => {
            console.error("Failed to save data:", err)
            // Optionally show a toast notification for save errors
        });
    }
  }, [appData, isLoading]);

  useEffect(() => {
    if (appData?.appName) {
      document.title = appData.appName;
    }
  }, [appData?.appName]);

  const handleUpdateLink = useCallback((updatedLink: LinkItem) => {
    setAppData(prevData => {
        if (!prevData) return null;
        return {
            ...prevData,
            links: prevData.links.map(link => link.id === updatedLink.id ? updatedLink : link),
        };
    });
    setEditingLink(null);
  }, []);

  const handleDeleteLink = useCallback((id: string) => {
    setAppData(prevData => {
        if (!prevData) return null;
        return {
            ...prevData,
            links: prevData.links.filter(link => link.id !== id),
        };
    });
  }, []);

  const handleToggleLink = useCallback((id: string) => {
     setAppData(prevData => {
      if (!prevData) return null;
      const links = prevData.links.map(link => 
        link.id === id ? { ...link, enabled: !link.enabled } : link
      );
      return { ...prevData, links };
    });
  }, []);

  const handleAppNameChange = useCallback((name: string) => {
    setAppData(prevData => prevData ? ({ ...prevData, appName: name }) : null);
  }, []);

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

  const handleSaveLink = (linkData: Omit<LinkItem, 'id'>) => {
    if (editingLink) {
      handleUpdateLink({ ...editingLink, ...linkData });
    } else {
       const newLink = { ...linkData, id: crypto.randomUUID(), enabled: true };
       setAppData(prev => prev ? ({...prev, links: [...prev.links, newLink]}) : null);
    }
    closeModal();
  };

  const handleAddParsedLinks = useCallback((parsedLinks: Omit<LinkItem, 'id' | 'type' | 'proxyConfig' | 'enabled' | 'category'>[]) => {
      setAppData(prevData => {
        if (!prevData) return null;
        const existingUrls = new Set(prevData.links.map(l => l.url));
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
            return { ...prevData, links: [...prevData.links, ...newUniqueLinks] };
        }
        return prevData;
      });
      setView('dashboard'); 
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !appData) {
    return <ConnectionError onRetry={fetchData} error={error || 'Application data is missing.'} />;
  }

  const filteredLinks = appData.links.filter(link => {
    const query = searchQuery.toLowerCase();
    return (
      link.title.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query) ||
      link.description.toLowerCase().includes(query) ||
      (link.category && link.category.toLowerCase().includes(query))
    );
  });

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
