import { getEnv, yes } from '@silverhand/essentials';

export type AdminConfig = {
  username: string;
  password: string;
  email?: string;
};

export type AppConfig = {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
};

export type SmtpConfig = {
  host: string;
  port: number;
  auth: { user: string; pass: string };
  fromEmail: string;
  replyTo?: string;
  secure: boolean;
};

export const getAdminConfig = (): AdminConfig | undefined => {
  const username = getEnv('LOGTO_ADMIN_USERNAME');
  const password = getEnv('LOGTO_ADMIN_PASSWORD');

  if (!username || !password) {
    return undefined;
  }

  return {
    username,
    password,
    email: getEnv('LOGTO_ADMIN_EMAIL') || undefined,
  };
};

export const getAppConfig = (): AppConfig | undefined => {
  const clientId = getEnv('LOGTO_APP_CLIENT_ID');
  const clientSecret = getEnv('LOGTO_APP_CLIENT_SECRET');
  const redirectUrisRaw = getEnv('LOGTO_APP_REDIRECT_URIS');

  if (!clientId || !clientSecret || !redirectUrisRaw) {
    return undefined;
  }

  const postLogoutRedirectUrisRaw = getEnv('LOGTO_APP_POST_LOGOUT_REDIRECT_URIS');

  return {
    name: getEnv('LOGTO_APP_NAME') || 'My Application',
    clientId,
    clientSecret,
    redirectUris: redirectUrisRaw.split(',').map((uri) => uri.trim()),
    postLogoutRedirectUris: postLogoutRedirectUrisRaw
      ? postLogoutRedirectUrisRaw.split(',').map((uri) => uri.trim())
      : [],
  };
};

export const getSmtpConfig = (): SmtpConfig | undefined => {
  const host = getEnv('LOGTO_SMTP_HOST');
  const portRaw = getEnv('LOGTO_SMTP_PORT');
  const username = getEnv('LOGTO_SMTP_USERNAME');
  const password = getEnv('LOGTO_SMTP_PASSWORD');
  const fromEmail = getEnv('LOGTO_SMTP_FROM_EMAIL');

  if (!host || !portRaw || !username || !password || !fromEmail) {
    return undefined;
  }

  return {
    host,
    port: Number(portRaw),
    auth: { user: username, pass: password },
    fromEmail,
    replyTo: getEnv('LOGTO_SMTP_REPLY_TO') || undefined,
    secure: yes(getEnv('LOGTO_SMTP_SECURE')),
  };
};
