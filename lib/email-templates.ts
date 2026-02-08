// Email templates for Artistrax

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  line-height: 1.6;
  color: #333;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background: #1F4E3D;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  margin: 16px 0;
`;

export const emailTemplates = {
  // Fan Welcome Email
  fanWelcome: (name: string, email: string) => `
    <div style="${baseStyles}">
      <h1 style="color: #1F4E3D;">Welcome to Artistrax, ${name}! 🎵</h1>
      
      <p>Thanks for joining the Artistrax community! You're now part of a platform where independent artists and labels share their music directly with fans like you.</p>
      
      <h2>What's Next?</h2>
      <ul>
        <li><strong>Discover Music</strong> - Browse tracks from independent artists and labels</li>
        <li><strong>Earn Rewards</strong> - Get 10 points for every $1 you spend (500 points = 1 free track!)</li>
        <li><strong>Create Playlists</strong> - Build your personal music library</li>
        <li><strong>Support Artists</strong> - 95% of your purchase goes directly to artists</li>
      </ul>
      
      <a href="https://music-download-store-2.vercel.app" style="${buttonStyles}">Start Exploring Music</a>
      
      <p style="color: #666; font-size: 14px; margin-top: 32px;">
        Questions? Reply to this email anytime.<br/>
        - The Artistrax Team
      </p>
    </div>
  `,

  // Artist Welcome Email
  artistWelcome: (name: string, username: string) => `
    <div style="${baseStyles}">
      <h1 style="color: #1F4E3D;">Welcome to Artistrax, ${name}! 🎨</h1>
      
      <p>Your artist account is ready! You now have 30 days to explore the platform with a free trial.</p>
      
      <h2>Get Started</h2>
      <ol>
        <li><strong>Upload Your First Track</strong> - Share your music with the world</li>
        <li><strong>Customize Your Profile</strong> - Add bio, avatar, and social links</li>
        <li><strong>Share Your Page</strong> - Your public page is at artistrax.com/${username}</li>
        <li><strong>Track Your Analytics</strong> - See downloads, plays, and revenue</li>
      </ol>
      
      <h2>Pricing</h2>
      <p>After your 30-day trial:</p>
      <ul>
        <li>Monthly: $20/month</li>
        <li>Annual: $96/year (save $144!)</li>
      </ul>
      
      <p><strong>You keep 95%</strong> of every sale. We only take 5% to cover platform costs.</p>
      
      <a href="https://music-download-store-2.vercel.app/artist/dashboard" style="${buttonStyles}">Go to Your Dashboard</a>
      
      <p style="color: #666; font-size: 14px; margin-top: 32px;">
        Questions? We're here to help.<br/>
        - The Artistrax Team
      </p>
    </div>
  `,

  // Label Welcome Email
  labelWelcome: (name: string, slug: string) => `
    <div style="${baseStyles}">
      <h1 style="color: #1F4E3D;">Welcome to Artistrax, ${name}! 🏢</h1>
      
      <p>Your label account is ready! You have 30 days to explore the platform with a free trial.</p>
      
      <h2>Get Started</h2>
      <ol>
        <li><strong>Upload Your Catalog</strong> - Use single or batch upload for multiple tracks</li>
        <li><strong>Manage Artists</strong> - Organize your roster and releases</li>
        <li><strong>Customize Your Page</strong> - Your public page is at artistrax.com/labels/${slug}</li>
        <li><strong>Track Performance</strong> - Monitor sales and downloads across your catalog</li>
      </ol>
      
      <h2>Pricing</h2>
      <p>After your 30-day trial:</p>
      <ul>
        <li>Monthly: $25/month</li>
        <li>Annual: $120/year (save $180!)</li>
      </ul>
      
      <p><strong>You keep 90%</strong> of every sale. We take 10% to maintain the platform.</p>
      
      <a href="https://music-download-store-2.vercel.app/label/dashboard" style="${buttonStyles}">Go to Your Dashboard</a>
      
      <p style="color: #666; font-size: 14px; margin-top: 32px;">
        Questions? We're here to help.<br/>
        - The Artistrax Team
      </p>
    </div>
  `,

  // Admin Notification: New Fan
  adminNewFan: (name: string, email: string) => `
    <div style="${baseStyles}">
      <h2>🎵 New Fan Signup</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
  `,

  // Admin Notification: New Artist
  adminNewArtist: (name: string, email: string, username: string) => `
    <div style="${baseStyles}">
      <h2>🎨 New Artist Signup</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Profile:</strong> <a href="https://music-download-store-2.vercel.app/${username}">View Profile</a></p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Trial ends:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
    </div>
  `,

  // Admin Notification: New Label
  adminNewLabel: (name: string, email: string, slug: string) => `
    <div style="${baseStyles}">
      <h2>🏢 New Label Signup</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Slug:</strong> ${slug}</p>
      <p><strong>Profile:</strong> <a href="https://music-download-store-2.vercel.app/labels/${slug}">View Profile</a></p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Trial ends:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
    </div>
  `,

  // Admin Notification: New Subscription
  adminNewSubscription: (accountType: string, name: string, email: string, tier: string, amount: string) => `
    <div style="${baseStyles}">
      <h2>💳 New Subscription</h2>
      <p><strong>Type:</strong> ${accountType}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Plan:</strong> ${tier}</p>
      <p><strong>Amount:</strong> ${amount}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
  `,
};
