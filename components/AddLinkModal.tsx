import React, { useState, useEffect, useRef } from 'react';
import { LinkItem, ProxyConfig } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import ToggleSwitch from './ToggleSwitch';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Omit<LinkItem, 'id' | 'enabled'>) => void;
  link: LinkItem | null;
  creationType: 'link' | 'service';
}

const defaultProxyConfig: ProxyConfig = {
    target: 'http://localhost:8000',
    enableSsl: false,
    sslCertPath: '/etc/ssl/certs/your_domain.crt',
    sslKeyPath: '/etc/ssl/private/your_domain.key',
    enableWebSockets: false,
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose, onSave, link, creationType }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
  });
  const [proxyData, setProxyData] = useState<ProxyConfig>(defaultProxyConfig);
  const [icon, setIcon] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemType = link?.type || creationType;

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title,
        url: link.url,
        description: link.description,
        category: link.category || '',
      });
      setIcon(link.icon);
      if (link.proxyConfig) {
        setProxyData(link.proxyConfig);
      } else {
        setProxyData(defaultProxyConfig);
      }
    } else {
      // Reset for new item
      setFormData({ title: '', url: '', description: '', category: '' });
      setIcon(null);
      setProxyData(defaultProxyConfig);
    }
  }, [link, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProxyData(prev => ({ ...prev, [name]: value }));
  };

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const applyPreset = (type: 'react' | 'nodejs') => {
      if (type === 'react') {
          setProxyData(prev => ({...prev, target: 'http://localhost:3000', enableWebSockets: true}));
      } else if (type === 'nodejs') {
           setProxyData(prev => ({...prev, target: 'http://localhost:8080', enableWebSockets: true}));
      }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLinkData: Omit<LinkItem, 'id' | 'enabled'> = {
        ...formData,
        icon: icon,
        type: itemType,
        ...(itemType === 'service' && { proxyConfig: proxyData }),
    }
    onSave(finalLinkData);
  };
  
  if (!isOpen) return null;
  
  const modalTitle = link 
    ? `Edit ${itemType === 'service' ? 'Service' : 'Link'}` 
    : `Add New ${itemType === 'service' ? 'Service' : 'Link'}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[--bg-secondary] rounded-xl shadow-2xl w-full max-w-lg border border-[--border-primary]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[--border-primary]">
          <h2 className="text-xl font-bold">{modalTitle}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-4">
                <div className="relative group">
                  {icon ? (
                    <img src={icon} alt="Icon preview" className="w-20 h-20 rounded-lg object-cover bg-[--bg-tertiary]" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-[--bg-tertiary] flex items-center justify-center">
                      <GlobeIcon />
                    </div>
                  )}
                  <button type="button" onClick={triggerFileUpload} className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <UploadIcon />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleIconUpload}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/svg+xml"
                  />
                </div>
                <div className="flex-grow space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-[--text-secondary] mb-1">Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full p-2 bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-[--text-secondary] mb-1">{itemType === 'service' ? 'Public URL (ServerName)' : 'URL'}</label>
                    <input type="text" name="url" id="url" value={formData.url} onChange={handleChange} required className="w-full p-2 bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" placeholder={itemType === 'service' ? 'https://my-service.local' : 'https://example.com'} />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-[--text-secondary] mb-1">Category</label>
                    <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className="w-full p-2 bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" placeholder="e.g. Monitoring" />
                </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[--text-secondary] mb-1">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={2} className="w-full p-2 bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" />
            </div>

            {itemType === 'service' && (
                <div className="space-y-4 pt-4 border-t border-[--border-primary]">
                    <h3 className="text-lg font-semibold">Reverse Proxy Settings</h3>
                     {!link && ( /* Show presets only on creation */
                         <div>
                            <label className="block text-sm font-medium text-[--text-secondary] mb-2">Apply Preset</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => applyPreset('react')} className="px-3 py-1 text-sm rounded-lg bg-[--bg-primary] hover:bg-[--bg-tertiary]">React</button>
                                <button type="button" onClick={() => applyPreset('nodejs')} className="px-3 py-1 text-sm rounded-lg bg-[--bg-primary] hover:bg-[--bg-tertiary]">Node.js</button>
                            </div>
                        </div>
                     )}
                    <div>
                        <label htmlFor="target" className="block text-sm font-medium text-[--text-secondary] mb-1">Proxy Target (Internal URL)</label>
                        <input type="url" name="target" id="target" value={proxyData.target} onChange={handleProxyChange} required className="w-full p-2 bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" placeholder="http://localhost:3000" />
                    </div>
                     <div className="space-y-3 pt-2">
                        <ToggleSwitch id="ssl-toggle" checked={proxyData.enableSsl} onChange={(c) => setProxyData(p => ({...p, enableSsl: c}))} label="Enable SSL"/>
                        {proxyData.enableSsl && (
                            <div className="pl-4 space-y-3 animate-fade-in border-l-2 border-cyan-500/50 ml-3">
                                <div>
                                    <label htmlFor="sslCertPath" className="block text-xs font-medium text-[--text-tertiary] mb-1">SSL Certificate Path</label>
                                    <input type="text" name="sslCertPath" id="sslCertPath" value={proxyData.sslCertPath} onChange={handleProxyChange} className="w-full p-2 text-sm bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" />
                                </div>
                                <div>
                                    <label htmlFor="sslKeyPath" className="block text-xs font-medium text-[--text-tertiary] mb-1">SSL Key Path</label>
                                    <input type="text" name="sslKeyPath" id="sslKeyPath" value={proxyData.sslKeyPath} onChange={handleProxyChange} className="w-full p-2 text-sm bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" />
                                </div>
                            </div>
                        )}
                        <ToggleSwitch id="ws-toggle" checked={proxyData.enableWebSockets} onChange={(c) => setProxyData(p => ({...p, enableWebSockets: c}))} label="Enable WebSockets"/>
                    </div>
                </div>
            )}
          </div>
          <div className="p-4 bg-[--bg-secondary]/50 rounded-b-xl flex justify-end gap-4 border-t border-[--border-primary]">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-[--bg-tertiary] hover:bg-opacity-80 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLinkModal;
