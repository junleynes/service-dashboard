import React from 'react';
import ApacheParser from './ApacheParser';
import { LinkItem } from '../types';
import { BackIcon } from './icons/BackIcon';
import { PlusIcon } from './icons/PlusIcon';
import ServiceListEditor from './ServiceListEditor';

interface SettingsPageProps {
    appName: string;
    onAppNameChange: (name: string) => void;
    links: LinkItem[];
    onBack: () => void;
    onAddLinks: (links: Omit<LinkItem, 'id' | 'type' | 'proxyConfig' | 'enabled'>[]) => void;
    onOpenAddModal: (type: 'link' | 'service') => void;
    onEditLink: (link: LinkItem) => void;
    onDeleteLink: (id: string) => void;
    onToggleLink: (id: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ appName, onAppNameChange, onBack, onAddLinks, onOpenAddModal, links, onEditLink, onDeleteLink, onToggleLink }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                 <button
                    onClick={onBack}
                    className="flex items-center gap-2 bg-[--bg-secondary] hover:bg-[--bg-tertiary] text-[--text-primary] font-bold py-2 px-4 rounded-lg transition-all duration-200 border border-[--border-primary] shadow-md hover:shadow-lg"
                >
                    <BackIcon/>
                    Back to Dashboard
                </button>
            </div>
            
            <div className="space-y-8">
                <div className="bg-[--bg-secondary]/50 backdrop-blur-md rounded-xl p-6 border border-[--border-primary]/50 shadow-lg">
                    <h2 className="text-xl font-semibold text-[--text-primary]">Branding</h2>
                    <p className="text-[--text-secondary] mt-2 mb-4 text-sm">
                        Customize the name of your dashboard. This will update the header and the browser tab title.
                    </p>
                    <div>
                        <label htmlFor="appName" className="block text-sm font-medium text-[--text-secondary] mb-1">Application Name</label>
                        <input 
                            type="text" 
                            name="appName" 
                            id="appName" 
                            value={appName} 
                            onChange={(e) => onAppNameChange(e.target.value)} 
                            className="w-full max-w-md p-2 bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" 
                        />
                    </div>
                 </div>

                 <h2 className="text-2xl font-semibold text-[--text-secondary] border-b border-[--border-primary]/50 pb-2">Service Management</h2>
                
                 <ServiceListEditor links={links} onEdit={onEditLink} onDelete={onDeleteLink} onToggle={onToggleLink} />

                 <div className="bg-[--bg-secondary]/50 backdrop-blur-md rounded-xl p-6 border border-[--border-primary]/50 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[--text-primary]">Add Forward Link</h3>
                        <p className="text-[--text-secondary] mt-1 mb-4 text-sm">For services that are already publicly accessible.</p>
                        <button
                            onClick={() => onOpenAddModal('link')}
                            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <PlusIcon />
                            Add Link
                        </button>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-[--text-primary]">Add Reverse Proxy Service</h3>
                        <p className="text-[--text-secondary] mt-1 mb-4 text-sm">For local services you want to expose via Apache.</p>
                        <button
                            onClick={() => onOpenAddModal('service')}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <PlusIcon />
                            Add Service
                        </button>
                    </div>
                 </div>
                 
                 <ApacheParser links={links} onAddLinks={onAddLinks} />
            </div>

        </div>
    );
};

export default SettingsPage;