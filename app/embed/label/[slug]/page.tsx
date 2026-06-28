// Label Embed Widget - for labels to put on their own websites
// Route: /embed/label/[slug]
// Lightweight, branded iframe version

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function LabelEmbed() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    fetch(`/api/label/${slug}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!data || !data.tracks?.length) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>No tracks available</div>
      </div>
    );
  }

  const { label, tracks } = data;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {label.logoUrl && (
          <img
            src={label.logoUrl}
            alt={label.name}
            style={styles.avatar}
          />
        )}
        <div>
          <h2 style={styles.title}>{label.name}</h2>
          <p style={styles.subtitle}>{tracks.length} tracks available</p>
        </div>
      </div>

      {/* Tracks */}
      <div style={styles.trackList}>
        {tracks.slice(0, 6).map((track, index) => (
          <a 
            key={track.id}
            href={track.buyUrl}
            target="_blank"
            rel="noopener"
            style={styles.trackCard}
          >
            <div style={styles.trackNumber}>{index + 1}</div>
            <div style={styles.trackImage}>
              {track.coverArt ? (
                <img src={track.coverArt} alt={track.title} style={styles.cover} />
              ) : (
                <div style={styles.placeholder}>🎵</div>
              )}
            </div>
            <div style={styles.trackInfo}>
              <div style={styles.trackTitle}>{track.title}</div>
              <div style={styles.trackArtist}>{track.artist}</div>
            </div>
            <div style={styles.trackPrice}>${track.price}</div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <a 
          href={`https://artistrax.com/labels/${slug}`}
          target="_blank"
          rel="noopener"
          style={styles.viewAll}
        >
          View all tracks on Artistrax →
        </a>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#1a1a1a',
    color: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    minHeight: '400px',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderBottom: '1px solid #333',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#888',
  },
  trackList: {
    padding: '16px',
  },
  trackCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'white',
    transition: 'background 0.2s',
  },
  trackNumber: {
    width: '24px',
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
  },
  trackImage: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  cover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#333',
    fontSize: '20px',
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trackArtist: {
    fontSize: '13px',
    color: '#888',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trackPrice: {
    fontWeight: 600,
    color: '#90EE90',
    fontSize: '14px',
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #333',
    textAlign: 'center',
  },
  viewAll: {
    color: '#FF8C69',
    textDecoration: 'none',
    fontSize: '14px',
  },
};