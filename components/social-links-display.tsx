'use client';

import { useEffect, useState } from 'react';
import { LINK_PLATFORMS, type LinkPlatform } from '@/lib/link-platforms';
import { ExternalLink } from 'lucide-react';

type SocialLink = {
  id: string;
  title: string;
  url: string;
  platform: LinkPlatform;
  position: number;
  click_count: number;
};

interface SocialLinksDisplayProps {
  artistId?: string;
  labelId?: string;
}

export function SocialLinksDisplay({ artistId, labelId }: SocialLinksDisplayProps) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, [artistId, labelId]);

  const loadLinks = async () => {
    if (!artistId && !labelId) return;

    try {
      const params = artistId ? `artistId=${artistId}` : `labelId=${labelId}`;
      const response = await fetch(`/api/links?${params}`);
      const data = await response.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error('Failed to load links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId: string) => {
    // Track click (non-blocking)
    fetch(`/api/links/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId }),
    }).catch(err => console.error('Failed to track click:', err));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-4">Links</h2>
      
      {links.map((link) => {
        const platformConfig = LINK_PLATFORMS[link.platform] || LINK_PLATFORMS.custom;
        
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick(link.id)}
            className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-[#1F4E3D] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${platformConfig.color}20` }}
                >
                  {platformConfig.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-[#1F4E3D] transition-colors">
                    {link.title}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {link.url.replace(/^https?:\/\//, '')}
                  </div>
                </div>
              </div>

              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#1F4E3D] flex-shrink-0" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
