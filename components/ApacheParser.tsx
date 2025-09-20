import React, { useState, useRef } from 'react';
import { LinkItem } from '../types';
import { ApacheIcon } from './icons/ApacheIcon';

interface ApacheParserProps {
    links: LinkItem[];
    onAddLinks: (links: Omit<LinkItem, 'id' | 'type' | 'proxyConfig' | 'enabled'>[]) => void;
}

const FolderOpenIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
    </svg>
);

const ApacheParser: React.FC<ApacheParserProps> = ({ links, onAddLinks }) => {
    const [configText, setConfigText] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showMessage = (text: string, type: 'success' | 'error' | 'info', duration = 5000) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), duration);
    };
    
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }

        try {
            const fileContents = await Promise.all(
                Array.from(files).map(file => {
                    return new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = e => resolve(e.target?.result as string);
                        reader.onerror = e => reject(e);
                        reader.readAsText(file);
                    });
                })
            );
            
            const annotatedContents = Array.from(files).map((file, index) => {
                return `# --- Start of ${file.name} ---\n${fileContents[index]}\n# --- End of ${file.name} ---`;
            });

            setConfigText(prevText => prevText ? `${prevText}\n\n${annotatedContents.join('\n\n')}` : annotatedContents.join('\n\n'));
            showMessage(`Loaded ${files.length} file(s). Click 'Parse' to continue.`, 'info');
        } catch (error) {
            console.error("Error reading files:", error);
            showMessage('Error reading one or more files.', 'error');
        }
        
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const parseConfig = () => {
        const vhostRegex = /<VirtualHost[\s\S]*?<\/VirtualHost>/g;
        const serverNameRegex = /ServerName\s+([^\s\n#]+)/;
        const proxyPassRegex = /ProxyPass\s+\/\s+(https:\/\/[^\s\n\/]+|http:\/\/[^\s\n\/]+)/;

        const vhosts = configText.match(vhostRegex) || [];
        if (vhosts.length === 0) {
            showMessage('No VirtualHost blocks found.', 'error');
            return;
        }
        
        const detectedLinks: Omit<LinkItem, 'id' | 'type' | 'proxyConfig' | 'enabled'>[] = vhosts.map(vhost => {
            const serverNameMatch = vhost.match(serverNameRegex);
            const proxyPassMatch = vhost.match(proxyPassRegex);

            if (serverNameMatch && proxyPassMatch) {
                return {
                    title: serverNameMatch[1],
                    url: `http://${serverNameMatch[1]}`,
                    description: `Apache Reverse Proxy to ${proxyPassMatch[1]} (Detected)`,
                    icon: null
                };
            }
            return null;
        }).filter((link): link is Omit<LinkItem, 'id' | 'type' | 'proxyConfig' | 'enabled'> => link !== null);
        
        const existingUrls = new Set(links.map(l => l.url));
        const newUniqueLinks = detectedLinks.filter(pl => !existingUrls.has(pl.url));
        const skippedCount = detectedLinks.length - newUniqueLinks.length;

        if (newUniqueLinks.length > 0) {
            onAddLinks(newUniqueLinks);
            let successMessage = `Successfully added ${newUniqueLinks.length} new service(s)!`;
            if (skippedCount > 0) {
                successMessage += ` ${skippedCount} service(s) already existed and were skipped.`;
            }
            showMessage(successMessage, 'success');
            setConfigText('');
        } else if (skippedCount > 0) {
             showMessage(`All ${skippedCount} detected service(s) already exist in the dashboard.`, 'info');
        }else {
            showMessage('Found VirtualHosts but could not extract valid ServerName and ProxyPass configurations.', 'error');
        }
    };

    const messageColor = {
        success: 'text-green-400',
        error: 'text-red-400',
        info: 'text-cyan-400'
    }[messageType];

    return (
        <div className="bg-[--bg-secondary]/50 backdrop-blur-md rounded-xl p-6 border border-[--border-primary]/50 shadow-lg">
            <div className="flex items-center gap-3">
                <ApacheIcon/>
                <h2 className="text-xl font-semibold text-[--text-primary]">Detect Services from Apache Config</h2>
            </div>
            <p className="text-[--text-secondary] mt-2 mb-4 text-sm">
                Paste your Apache .conf file content below, or upload files directly from your <code className="bg-[--bg-primary] text-[--text-tertiary] px-1 py-0.5 rounded">/etc/apache2/sites-enabled</code> directory.
            </p>
            <textarea
                className="w-full h-32 p-3 bg-[--bg-primary] border border-[--border-primary] rounded-md font-mono text-sm text-[--text-secondary] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                placeholder="<VirtualHost *:80>&#10;  ServerName my-app.local&#10;  ProxyPass / http://localhost:3000/&#10;  ProxyPassReverse / http://localhost:3000/&#10;</VirtualHost>"
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
            />
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept=".conf,.txt,text/plain"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                 <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={triggerFileUpload}
                        className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        <FolderOpenIcon />
                        Load from Files...
                    </button>
                    <button 
                        onClick={parseConfig}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-500"
                        disabled={!configText}
                    >
                        Parse & Add Services
                    </button>
                </div>
                {message && <p className={`text-sm ${messageColor} flex-shrink-0`}>{message}</p>}
            </div>
        </div>
    );
};

export default ApacheParser;