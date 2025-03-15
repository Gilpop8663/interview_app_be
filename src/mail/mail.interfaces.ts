export interface MailModuleOptions {
  user: string;
  pass: string;
  apiKey: string;
  domain: string;
}

export type MailTemplate = 'verify-email' | 'reset-password';

export interface EmailVar {
  key: string;
  value: string;
}
