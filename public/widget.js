// Artistrax Label Widget
// Drop this script on any website to show your catalog
// Usage: <script src="https://artistrax.com/widget.js" data-label="your-label-slug"></script>

(function() {
  'use strict';

  const script = document.currentScript;
  const labelSlug = script?.dataset?.label;
  
  if (!labelSlug) {
    console.error('Artistrax Widget: data-label attribute required');
    return;
  }

  const containerId = 'artistrax-widget-' + labelSlug;
  const apiUrl = 'https://artistrax.com/api/label/' + labelSlug + '/tracks';

  // Create container
  const container = document.createElement('div');
  container.id = containerId;
  container.style.cssText = `
    font-family: system-ui, -apple-system, sans-serif;
    background: #1a1a1a;
    color: white;
    border-radius: 12px;
    overflow: hidden;
    max-width: 100%;
  `;

  // Insert after script
  script.parentNode.insertBefore(container, script.nextSibling);

  // Show loading
  container.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">Loading catalog...</div>';

  // Fetch data
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      if (data.error || !data.tracks?.length) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">No tracks available</div>';
        return;
      }

      const { label, tracks } = data;
      
      container.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #333; display: flex; align-items: center; gap: 16px;">
          ${label.avatar ? `<img src="${label.avatar}" alt="${label.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">` : ''}
          <div>
            <h3 style="margin: 0; font-size: 20px;">${label.name}</h3>
            <p style="margin: 4px 0 0; color: #888; font-size: 14px;">${tracks.length} tracks</p>
          </div>
        </div>
        <div style="padding: 16px;">
          ${tracks.slice(0, 5).map((track, i) => `
            <a href="${track.buyUrl}" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 12px; padding: 12px; text-decoration: none; color: white; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#333'" onmouseout="this.style.background='transparent'">
              <span style="width: 24px; text-align: center; color: #666; font-size: 14px;">${i + 1}</span>
              <div style="width: 48px; height: 48px; border-radius: 4px; overflow: hidden; flex-shrink: 0; background: #333;">
                ${track.coverArt ? `<img src="${track.coverArt}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px;">🎵</div>'}
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</div>
                <div style="font-size: 13px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.artist}</div>
              </div>
              <div style="font-weight: 600; color: #90EE90; font-size: 14px;">$${track.price}</div>
            </a>
          `).join('')}
        </div>
        <div style="padding: 16px; border-top: 1px solid #333; text-align: center;">
          <a href="https://artistrax.com/labels/${labelSlug}" target="_blank" rel="noopener" style="color: #FF8C69; text-decoration: none; font-size: 14px;">View all tracks on Artistrax →</a>
        </div>
      `;
    })
    .catch(err => {
      console.error('Artistrax Widget Error:', err);
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">Failed to load catalog</div>';
    });
})();