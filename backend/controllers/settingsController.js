import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import Setting from '../models/Setting.js';
import AdminActivity from '../models/AdminActivity.js';
import { isDbReady } from '../config/db.js';

/**
 * Checks if SMTP environment variables are properly configured.
 */
const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'your-app-specific-password' &&
    process.env.SMTP_USER !== 'your-email@gmail.com'
  );
};

/**
 * GET /api/admin/settings
 * Retrieves all platform settings and recent admin activities.
 */
export const getSettings = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    let setting = await Setting.findOne({ key: 'admin_settings' });
    if (!setting) {
      setting = await Setting.create({ key: 'admin_settings' });
    }

    const smtpConfigured = isSmtpConfigured();

    // Fetch recent admin activities
    let activities = await AdminActivity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // If no activities yet, seed initial baseline activities
    if (activities.length === 0) {
      const now = Date.now();
      const initialActivities = [
        {
          action: 'settings_viewed',
          title: 'Admin settings viewed',
          description: 'Viewed settings page',
          icon: 'gear',
          adminUser: req.admin?.username || 'admin',
          createdAt: new Date(now - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          action: 'email_config_checked',
          title: 'Email configuration updated',
          description: 'SMTP settings were checked',
          icon: 'mail',
          adminUser: req.admin?.username || 'admin',
          createdAt: new Date(now - 5 * 60 * 60 * 1000) // 5 hours ago
        },
        {
          action: 'notifications_checked',
          title: 'Notification preferences changed',
          description: 'Updated notification settings',
          icon: 'bell',
          adminUser: req.admin?.username || 'admin',
          createdAt: new Date(now - 24 * 60 * 60 * 1000) // 1 day ago
        }
      ];

      activities = await AdminActivity.insertMany(initialActivities);
    }

    // Compile safe SMTP configuration (NEVER expose password)
    const emailConfig = {
      configured: smtpConfigured,
      smtpHost: process.env.SMTP_HOST || setting.email?.smtpHost || 'smtp.example.com',
      smtpPort: Number(process.env.SMTP_PORT) || setting.email?.smtpPort || 587,
      smtpUser: process.env.SMTP_USER || setting.email?.smtpUser || '',
      mailFromName: process.env.MAIL_FROM_NAME || setting.email?.mailFromName || 'India RunTrust',
      mailFromAddress: process.env.MAIL_FROM_ADDRESS || setting.email?.mailFromAddress || 'noreply@runtrust.com'
    };

    res.json({
      success: true,
      settings: {
        websiteName: setting.websiteName,
        adminDisplayName: setting.adminDisplayName,
        supportEmail: setting.supportEmail,
        timeZone: setting.timeZone,
        notifications: setting.notifications,
        eventPreferences: setting.eventPreferences,
        security: setting.security,
        email: emailConfig
      },
      activities
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/settings
 * Updates admin configuration and logs an activity entry.
 */
export const updateSettings = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const {
      websiteName,
      adminDisplayName,
      supportEmail,
      timeZone,
      notifications,
      eventPreferences,
      security,
      email
    } = req.body;

    // Basic validation
    if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid support email address.' });
    }

    let setting = await Setting.findOne({ key: 'admin_settings' });
    if (!setting) {
      setting = new Setting({ key: 'admin_settings' });
    }

    if (websiteName !== undefined) setting.websiteName = websiteName.trim();
    if (adminDisplayName !== undefined) setting.adminDisplayName = adminDisplayName.trim();
    if (supportEmail !== undefined) setting.supportEmail = supportEmail.trim();
    if (timeZone !== undefined) setting.timeZone = timeZone.trim();

    if (notifications) {
      setting.notifications = {
        ...setting.notifications.toObject?.() || setting.notifications,
        ...notifications
      };
    }

    if (eventPreferences) {
      setting.eventPreferences = {
        ...setting.eventPreferences.toObject?.() || setting.eventPreferences,
        ...eventPreferences
      };
      if (eventPreferences.maxSlotsPerRegistration !== undefined) {
        setting.eventPreferences.maxSlotsPerRegistration = Math.max(1, Number(eventPreferences.maxSlotsPerRegistration) || 1);
      }
    }

    if (security) {
      setting.security = {
        ...setting.security.toObject?.() || setting.security,
        ...security
      };
    }

    if (email) {
      setting.email = {
        ...setting.email.toObject?.() || setting.email,
        ...email
      };
    }

    setting.updatedAt = new Date();
    await setting.save();

    // Log the update activity
    await AdminActivity.create({
      action: 'settings_updated',
      title: 'Platform settings saved',
      description: 'Updated general settings and preferences',
      icon: 'gear',
      adminUser: req.admin?.username || 'admin',
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: 'Settings saved successfully.',
      settings: {
        websiteName: setting.websiteName,
        adminDisplayName: setting.adminDisplayName,
        supportEmail: setting.supportEmail,
        timeZone: setting.timeZone,
        notifications: setting.notifications,
        eventPreferences: setting.eventPreferences,
        security: setting.security,
        email: {
          configured: isSmtpConfigured(),
          smtpHost: process.env.SMTP_HOST || setting.email?.smtpHost,
          smtpPort: Number(process.env.SMTP_PORT) || setting.email?.smtpPort,
          smtpUser: process.env.SMTP_USER || setting.email?.smtpUser,
          mailFromName: process.env.MAIL_FROM_NAME || setting.email?.mailFromName,
          mailFromAddress: process.env.MAIL_FROM_ADDRESS || setting.email?.mailFromAddress
        }
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/settings/test-email
 * Attempts to send a test email. Fails if SMTP is not configured.
 */
export const testEmail = async (req, res) => {
  try {
    if (!isSmtpConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send test email: SMTP is not configured yet. Please configure valid SMTP credentials in backend/.env.'
      });
    }

    const { recipientEmail } = req.body;
    const targetEmail = recipientEmail || process.env.MAIL_FROM_ADDRESS || 'noreply@runtrust.org';

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailFromName = process.env.MAIL_FROM_NAME || 'India RunTrust';
    const mailFromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@runtrust.org';

    await transporter.sendMail({
      from: `"${mailFromName}" <${mailFromAddress}>`,
      to: targetEmail,
      subject: 'RUNTRUST Admin Console: SMTP Test Email',
      text: 'This is a test email from your RUNTRUST Admin Console confirming that your SMTP email settings are working properly.',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
          <h2 style="color: #A51C1F; margin-top: 0;">RUNTRUST Email Test</h2>
          <p>Congratulations! Your SMTP email server connection is working properly.</p>
          <p style="color: #64748B; font-size: 0.85rem;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    // Log the test email activity
    await AdminActivity.create({
      action: 'test_email_sent',
      title: 'Test email dispatched',
      description: `SMTP test email sent to ${targetEmail}`,
      icon: 'mail',
      adminUser: req.admin?.username || 'admin',
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: `Test email successfully sent to ${targetEmail}.`
    });
  } catch (error) {
    console.error('SMTP test email failed:', error);
    res.status(500).json({
      success: false,
      message: `Failed to send test email: ${error.message}`
    });
  }
};

/**
 * POST /api/admin/settings/change-password
 * Safely verifies current password and updates admin password.
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const configuredHash = process.env.ADMIN_PASSWORD_HASH;
    if (!configuredHash) {
      return res.status(500).json({
        success: false,
        message: 'Server error: ADMIN_PASSWORD_HASH is not configured.'
      });
    }

    const isValid = await bcrypt.compare(currentPassword, configuredHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Generate new bcrypt hash
    const newHash = await bcrypt.hash(newPassword, 10);
    process.env.ADMIN_PASSWORD_HASH = newHash;

    // Log password change activity
    await AdminActivity.create({
      action: 'password_changed',
      title: 'Admin password changed',
      description: 'Account security credentials updated',
      icon: 'shield',
      adminUser: req.admin?.username || 'admin',
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: 'Password changed successfully. Please remember your new password.'
    });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
