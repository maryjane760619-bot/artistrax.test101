import { resend, FROM_EMAIL, ADMIN_EMAIL, EMAIL_SUBJECTS } from './resend';
import { emailTemplates } from './email-templates';

// Helper function to send emails
async function sendEmail(to: string, subject: string, html: string) {
  // Skip if Resend is not configured
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
    console.log('Resend not configured, skipping email to:', to);
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    
    console.log(`Email sent to ${to}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return { success: false, error };
  }
}

// Fan Welcome Email
export async function sendFanWelcomeEmail(name: string, email: string) {
  await sendEmail(
    email,
    EMAIL_SUBJECTS.fanWelcome,
    emailTemplates.fanWelcome(name, email)
  );
  
  // Notify admin
  await sendEmail(
    ADMIN_EMAIL,
    EMAIL_SUBJECTS.adminNewFan,
    emailTemplates.adminNewFan(name, email)
  );
}

// Artist Welcome Email
export async function sendArtistWelcomeEmail(name: string, email: string, username: string) {
  await sendEmail(
    email,
    EMAIL_SUBJECTS.artistWelcome,
    emailTemplates.artistWelcome(name, username)
  );
  
  // Notify admin
  await sendEmail(
    ADMIN_EMAIL,
    EMAIL_SUBJECTS.adminNewArtist,
    emailTemplates.adminNewArtist(name, email, username)
  );
}

// Label Welcome Email
export async function sendLabelWelcomeEmail(name: string, email: string, slug: string) {
  await sendEmail(
    email,
    EMAIL_SUBJECTS.labelWelcome,
    emailTemplates.labelWelcome(name, slug)
  );
  
  // Notify admin
  await sendEmail(
    ADMIN_EMAIL,
    EMAIL_SUBJECTS.adminNewLabel,
    emailTemplates.adminNewLabel(name, email, slug)
  );
}

// Subscription Notification (to admin only)
export async function sendSubscriptionNotification(
  accountType: string,
  name: string,
  email: string,
  tier: string,
  amount: string
) {
  await sendEmail(
    ADMIN_EMAIL,
    EMAIL_SUBJECTS.adminNewSubscription,
    emailTemplates.adminNewSubscription(accountType, name, email, tier, amount)
  );
}
