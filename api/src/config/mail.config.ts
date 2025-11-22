export const mailConfig = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASSWORD || '',
  },
  from: {
    name: process.env.MAIL_FROM_NAME || 'SIGI - Sistema de Gestión de Incapacidades',
    email: process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER || 'noreply@sigi.com',
  },
};
