
import React, { useState, useEffect } from 'react';
import { LinkItem } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import ToggleSwitch from './ToggleSwitch';

interface ManualProxyConfigProps {
    onAddLinks: (links: Omit<LinkItem, 'id' | 'type'>[]) => void;
}

const ManualProxyConfig: React.FC<ManualProxyConfigProps> = ({ onAddLinks }) => {
    const [serverName, setServerName] = useState('');
    const [proxyTarget, setProxyTarget] = useState('');
    const [enableSsl, setEnableSsl] = useState(false);
    const [sslCertPath, setSslCertPath] = useState('/etc/ssl/certs/your_domain.crt');
    const [sslKeyPath, setSslKeyPath] = useState('/etc/ssl/private/your_domain.key');
    const [enableWebSockets, setEnableWebSockets] = useState(false);
    const [appType, setAppType] = useState<'generic' | 'react' | 'nodejs'>('generic');
    
    const [generatedConfig, setGeneratedConfig] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (appType === 'react') {
            setProxyTarget('http://localhost:3000');
            setEnableWebSockets(true);
        } else if (appType === 'nodejs') {
            setProxyTarget('http://localhost:8080');
            setEnableWebSockets(true);
        } else {
             setProxyTarget('http://localhost:8000');
             setEnableWebSockets(false);
        }
    }, [appType]);

    useEffect(() => {
        const port = enableSsl ? 443 : 80;
        const protocol = proxyTarget.startsWith('https://') ? 'https' : 'http';
        const wsProtocol = protocol === 'https' ? 'wss' : 'ws';

        let config = `<VirtualHost *:${port}>\n`;
        config += `    ServerName ${serverName || 'your-domain.com'}\n\n`;

        if (enableSsl) {
            config += '    SSLEngine on\n';
            config += `    SSLCertificateFile "${sslCertPath}"\n`;
            config += `    SSLCertificateKeyFile "${sslKeyPath}"\n\n`;
        }
        
        config += '    # Basic reverse proxy\n';
        config += `    ProxyPass / ${proxyTarget}/\n`;
        config += `    ProxyPassReverse / ${proxyTarget}/\n`;

        if (enableWebSockets) {
            config += '\n    # WebSocket proxy configuration\n';
            config += '    RewriteEngine On\n';
            config += '    RewriteCond %{HTTP:Upgrade} websocket [NC]\n';
            config += '    RewriteCond %{HTTP:Connection} upgrade [NC]\n';
            const wsTarget = `${wsProtocol}://${proxyTarget.replace(/^https?:\/\//, '')}/`;
            config += `    RewriteRule ^/?(.*) "${wsTarget}$1" [P,L]\n`;
        }
        
        config += '</VirtualHost>';

        setGeneratedConfig(config);
    }, [serverName, proxyTarget, enableSsl, sslCertPath, sslKeyPath, enableWebSockets]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedConfig);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddToDashboard = () => {
        if (!serverName || !proxyTarget) {
            alert('Please fill in both Server Name and Proxy Target.');
            return;
        }
        // FIX: The 'enabled' property was missing, causing a type error.
        // Also added the proxyConfig to ensure the configured settings are passed.
        const newLink: Omit<LinkItem, 'id' | 'type'> = {
            title: serverName,
            url: `${enableSsl ? 'https' : 'http'}://${serverName}`,
            description: `Reverse proxy to ${proxyTarget}`,
            icon: null,
            enabled: true,
            proxyConfig: {
                target: proxyTarget,
                enableSsl,
                sslCertPath,
                sslKeyPath,
                enableWebSockets,
            },
        };
        onAddLinks([newLink]);
    };

    const appTypeClasses = (type: typeof appType) => 
        `px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
        appType === type 
        ? 'bg-cyan-500 text-white font-semibold' 
        : 'bg-[--bg-primary] hover:bg-[--bg-tertiary] text-[--text-secondary]'
    }`;

    return (
        <div className="bg-[--bg-secondary]/50 backdrop-blur-md rounded-xl p-6 border border-[--border-primary]/50 shadow-lg">
            <h3 className="text-xl font-semibold text-[--text-primary]">Configure Reverse Proxy Service</h3>
            <p className="text-[--text-secondary] mt-2 mb-4 text-sm">Generate an Apache VirtualHost configuration for your service and add it to the dashboard.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Application Preset</label>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setAppType('generic')} className={appTypeClasses('generic')}>Generic</button>
                            <button onClick={() => setAppType('react')} className={appTypeClasses('react')}>React</button>
                            <button onClick={() => setAppType('nodejs')} className={appTypeClasses('nodejs')}>Node.js</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="serverName" className="block text-sm font-medium text-[--text-secondary] mb-1">Server Name (Public URL)</label>
                        <input type="text" name="serverName" id="serverName" value={serverName} onChange={(e) => setServerName(e.target.value)} required className="w-full p-2 bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" placeholder="my-app.local" />
                    </div>
                    <div>
                        <label htmlFor="proxyTarget" className="block text-sm font-medium text-[--text-secondary] mb-1">Proxy Target (Internal URL)</label>
                        <input type="url" name="proxyTarget" id="proxyTarget" value={proxyTarget} onChange={(e) => setProxyTarget(e.target.value)} required className="w-full p-2 bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" placeholder="http://localhost:3000" />
                    </div>
                    <div className="space-y-3 pt-2">
                        <ToggleSwitch id="ssl-toggle" checked={enableSsl} onChange={setEnableSsl} label="Enable SSL"/>
                        {enableSsl && (
                            <div className="pl-4 space-y-3 animate-fade-in border-l-2 border-cyan-500/50 ml-3">
                                <div>
                                    <label htmlFor="sslCertPath" className="block text-xs font-medium text-[--text-tertiary] mb-1">SSL Certificate Path</label>
                                    <input type="text" name="sslCertPath" id="sslCertPath" value={sslCertPath} onChange={(e) => setSslCertPath(e.target.value)} className="w-full p-2 text-sm bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" />
                                </div>
                                <div>
                                    <label htmlFor="sslKeyPath" className="block text-xs font-medium text-[--text-tertiary] mb-1">SSL Key Path</label>
                                    <input type="text" name="sslKeyPath" id="sslKeyPath" value={sslKeyPath} onChange={(e) => setSslKeyPath(e.target.value)} className="w-full p-2 text-sm bg-[--bg-primary] border border-[--border-primary] rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" />
                                </div>
                            </div>
                        )}
                        <ToggleSwitch id="ws-toggle" checked={enableWebSockets} onChange={setEnableWebSockets} label="Enable WebSockets"/>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-[--text-secondary] mb-1">Generated Configuration</label>
                    <div className="relative">
                        <pre className="w-full h-[22rem] p-4 overflow-auto bg-[--bg-primary] border border-[--border-primary] rounded-md font-mono text-sm text-[--text-secondary]">
                            <code>{generatedConfig}</code>
                        </pre>
                        <button onClick={handleCopy} className="absolute top-2 right-2 p-2 rounded-lg bg-[--bg-secondary] hover:bg-[--bg-tertiary] text-[--text-secondary] transition-colors" aria-label="Copy configuration">
                            {copied ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                    <button onClick={handleAddToDashboard} disabled={!serverName || !proxyTarget} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        Add to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualProxyConfig;