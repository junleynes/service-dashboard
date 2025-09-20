import React from 'react';
import { LinkItem } from '../types';
import { GlobeIcon } from './icons/GlobeIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import ToggleSwitch from './ToggleSwitch';

interface ServiceListEditorProps {
    links: LinkItem[];
    onEdit: (link: LinkItem) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}

const ServiceListEditor: React.FC<ServiceListEditorProps> = ({ links, onEdit, onDelete, onToggle }) => {
    return (
        <div className="bg-[--bg-secondary]/50 backdrop-blur-md rounded-xl p-6 border border-[--border-primary]/50 shadow-lg">
            <h3 className="text-xl font-semibold text-[--text-primary]">Manage Services & Links</h3>
            <p className="text-[--text-secondary] mt-2 mb-4 text-sm">Edit, remove, or disable existing entries from your dashboard.</p>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {links.length > 0 ? links.map(link => (
                    <div key={link.id} className={`flex items-center justify-between p-3 bg-[--bg-primary] rounded-lg border border-[--border-primary]/50 transition-opacity ${!link.enabled ? 'opacity-70' : ''}`}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            {link.icon ? (
                                <img src={link.icon} alt={link.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-md bg-[--bg-tertiary] flex items-center justify-center flex-shrink-0">
                                    <GlobeIcon />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold truncate text-[--text-primary]">{link.title}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm truncate text-[--text-secondary]">{link.url}</p>
                                    {link.category && (
                                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full flex-shrink-0">{link.category}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                            <ToggleSwitch 
                                id={`toggle-${link.id}`}
                                checked={link.enabled}
                                onChange={() => onToggle(link.id)}
                                ariaLabel={`Enable or disable ${link.title}`}
                            />
                            <button
                                onClick={() => onEdit(link)}
                                className="p-2 rounded-md hover:bg-[--bg-tertiary] text-[--text-secondary] hover:text-[--text-primary] transition-colors"
                                aria-label={`Edit ${link.title}`}
                            >
                                <PencilIcon />
                            </button>
                            <button
                                onClick={() => onDelete(link.id)}
                                className="p-2 rounded-md hover:bg-red-500/20 text-[--text-secondary] hover:text-red-500 transition-colors"
                                aria-label={`Delete ${link.title}`}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-[--text-secondary] py-4">No services or links to manage.</p>
                )}
            </div>
        </div>
    );
};

export default ServiceListEditor;
