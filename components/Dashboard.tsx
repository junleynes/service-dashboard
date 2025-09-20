import React from 'react';
import { LinkItem } from '../types';
import LinkCard from './LinkCard';
import StatusCards from './StatusCards';

interface DashboardProps {
  links: LinkItem[];
  onUpdate: (link: LinkItem) => void;
  searchQuery: string;
}

const Dashboard: React.FC<DashboardProps> = ({ links, onUpdate, searchQuery }) => {
  
  const services = links
    .filter(link => link.type === 'service')
    .sort((a, b) => a.title.localeCompare(b.title));
  
  const regularLinks = links
    .filter(link => link.type === 'link')
    .sort((a, b) => a.title.localeCompare(b.title));

  const renderGrid = (items: LinkItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(link => (
        <LinkCard 
          key={link.id} 
          link={link} 
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );

  return (
    <div className="mt-8 animate-fade-in">
      <StatusCards links={links} />

      {links.length > 0 ? (
        <div className="space-y-12">
          {services.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-[--text-secondary] mb-4">
                Services
              </h2>
              {renderGrid(services)}
            </section>
          )}

          {regularLinks.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-[--text-secondary] mb-4">
                Links
              </h2>
              {renderGrid(regularLinks)}
            </section>
          )}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-[--bg-secondary]/50 rounded-lg border border-[--border-primary]/50">
          {searchQuery ? (
            <>
              <h3 className="text-xl text-[--text-secondary]">No items found</h3>
              <p className="text-[--text-tertiary] mt-2">Your search for "{searchQuery}" did not match any services or links.</p>
            </>
          ) : (
            <>
              <h3 className="text-xl text-[--text-secondary]">No services or links yet!</h3>
              <p className="text-[--text-tertiary] mt-2">Navigate to settings to add your first service or link.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;