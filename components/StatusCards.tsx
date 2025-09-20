import React from 'react';
import { LinkItem } from '../types';
import { ServerIcon } from './icons/ServerIcon';
import { LinkIcon } from './icons/LinkIcon';
import { OnlineIcon } from './icons/OnlineIcon';
import { OfflineIcon } from './icons/OfflineIcon';

interface StatusCardsProps {
    links: LinkItem[];
}

interface StatusCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    colorClass: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, icon, colorClass }) => {
    return (
        <div className="bg-[--bg-secondary]/60 backdrop-blur-md rounded-xl shadow-lg p-5 flex items-center gap-4 border border-[--border-primary]/50">
            <div className={`p-3 rounded-full ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-[--text-secondary]">{title}</p>
                <p className="text-2xl font-bold text-[--text-primary]">{value}</p>
            </div>
        </div>
    );
};


const StatusCards: React.FC<StatusCardsProps> = ({ links }) => {
    const activeServices = links.filter(l => l.type === 'service' && l.enabled).length;
    const activeLinks = links.filter(l => l.type === 'link' && l.enabled).length;
    const onlineCount = links.filter(l => l.enabled).length;
    const offlineCount = links.filter(l => !l.enabled).length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatusCard
                title="Active Services"
                value={activeServices}
                icon={<ServerIcon />}
                colorClass="bg-blue-500/20 text-blue-400"
            />
            <StatusCard
                title="Active Links"
                value={activeLinks}
                icon={<LinkIcon />}
                 colorClass="bg-purple-500/20 text-purple-400"
            />
            <StatusCard
                title="Total Online"
                value={onlineCount}
                icon={<OnlineIcon />}
                colorClass="bg-green-500/20 text-green-400"
            />
            <StatusCard
                title="Total Offline"
                value={offlineCount}
                icon={<OfflineIcon />}
                colorClass="bg-red-500/20 text-red-400"
            />
        </div>
    );
};

export default StatusCards;