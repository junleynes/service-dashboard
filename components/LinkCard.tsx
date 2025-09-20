import React, { useRef } from 'react';
import { LinkItem } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface LinkCardProps {
  link: LinkItem;
  onUpdate: (link: LinkItem) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...link, icon: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative bg-[--bg-secondary]/60 backdrop-blur-md rounded-xl shadow-lg border border-[--border-primary]/50 overflow-hidden transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/50 hover:-translate-y-1 flex flex-col ${!link.enabled ? 'opacity-60' : ''}`}>
      {!link.enabled && (
        <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          OFFLINE
        </div>
      )}
      <div className="p-5 flex-grow">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="relative group">
              {link.icon ? (
                <img src={link.icon} alt={link.title} className="w-16 h-16 rounded-lg object-cover bg-[--bg-tertiary]" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[--bg-tertiary] flex items-center justify-center">
                   <GlobeIcon/>
                </div>
              )}
               <button onClick={triggerFileUpload} className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <UploadIcon />
               </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[--text-primary]">{link.title}</h3>
              <p className="text-sm text-cyan-400 break-all">{link.url}</p>
            </div>
          </div>
        </div>
        <p className="text-[--text-secondary] mt-4 text-sm">{link.description}</p>
        {link.category && (
            <div className="mt-4">
                <span className="text-xs font-semibold bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-full">
                    {link.category}
                </span>
            </div>
        )}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleIconUpload}
            className="hidden"
            accept="image/png, image/jpeg, image/gif, image/svg+xml"
        />
      </div>
      {link.enabled ? (
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="block bg-[--bg-tertiary]/50 hover:bg-cyan-500/80 text-center py-3 font-semibold transition-colors duration-200 mt-auto">
          Launch
        </a>
      ) : (
        <div className="block bg-[--bg-tertiary]/30 text-[--text-tertiary] text-center py-3 font-semibold mt-auto">
          Disabled
        </div>
      )}
    </div>
  );
};

export default LinkCard;