import React from 'react';

export interface ProxyConfig {
  target: string;
  enableSsl: boolean;
  sslCertPath: string;
  sslKeyPath: string;
  enableWebSockets: boolean;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string; // This will be the public-facing URL
  description: string;
  icon: string | null;
  type: 'link' | 'service';
  enabled: boolean;
  category?: string;
  proxyConfig?: ProxyConfig; // Settings are now per-item
}
