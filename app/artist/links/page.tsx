'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PLATFORM_OPTIONS, LINK_PLATFORMS, type LinkPlatform } from '@/lib/link-platforms';
import { Plus, Trash2, GripVertical, Eye, EyeOff, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type SocialLink = {
  id: string;
  title: string;
  url: string;
  platform: LinkPlatform;
  position: number;
  is_visible: boolean;
  click_count: number;
};

export default function ArtistLinksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPlatform, setNewPlatform] = useState<LinkPlatform>('custom');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/artist/login');
    }

    if (user) {
      loadLinks();
    }
  }, [user, authLoading]);

  const authHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  };

  const loadLinks = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/links?artistId=${user.id}`, { headers: await authHeader() });
      const data = await response.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error('Failed to load links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
        body: JSON.stringify({
          artistId: user.id,
          title: newTitle,
          url: newUrl,
          platform: newPlatform,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLinks([...links, data.link]);
        setNewTitle('');
        setNewUrl('');
        setNewPlatform('custom');
        setShowAddForm(false);
      } else {
        alert(data.error || 'Failed to add link');
      }
    } catch (error) {
      console.error('Failed to add link:', error);
      alert('Failed to add link');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (link: SocialLink) => {
    try {
      await fetch('/api/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
        body: JSON.stringify({
          id: link.id,
          isVisible: !link.is_visible,
        }),
      });

      setLinks(links.map(l => 
        l.id === link.id ? { ...l, is_visible: !l.is_visible } : l
      ));
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Delete this link?')) return;

    try {
      await fetch(`/api/links?id=${linkId}`, { method: 'DELETE', headers: await authHeader() });
      setLinks(links.filter(l => l.id !== linkId));
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/artist/dashboard" className="text-2xl font-serif font-semibold">
              artistrax
            </Link>
            <Link href="/artist/dashboard">
              <Button variant="ghost" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Social Links</h1>
          <p className="text-muted-foreground">
            Add links to your social media, streaming platforms, and websites
          </p>
        </div>

        {/* Add Link Button */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="mb-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        )}

        {/* Add Link Form */}
        {showAddForm && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Link</h2>
            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <Label>Platform</Label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as LinkPlatform)}
                  className="w-full mt-1 px-4 py-2 bg-background border border-border rounded-md"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Follow me on Instagram"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>URL</Label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={LINK_PLATFORMS[newPlatform].placeholder}
                  type="url"
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Link'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Links List */}
        <div className="space-y-3">
          {links.length === 0 && !showAddForm && (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No links yet</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Link
              </Button>
            </div>
          )}

          {links.map((link) => {
            const platformConfig = LINK_PLATFORMS[link.platform] || LINK_PLATFORMS.custom;
            
            return (
              <div
                key={link.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                  
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${platformConfig.color}20` }}
                  >
                    {platformConfig.icon}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium">{link.title}</div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      {link.url.replace(/^https?:\/\//, '').substring(0, 40)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {link.click_count} clicks
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleToggleVisibility(link)}
                  >
                    {link.is_visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {links.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>💡 Tip:</strong> These links will appear on your public profile page. Share your profile to replace Linktree!
          </div>
        )}
      </main>
    </div>
  );
}
