import { appendPath } from '@silverhand/essentials';
import dotenv from 'dotenv';

dotenv.config();

export const tunnelPort = process.env.TUNNEL_PORT ?? 9000;
export const tenantId = process.env.LOGTO_TENANT_ID;

export const logtoExperienceUrl = `https://${tenantId}.app.logto.dev`;
export const logtoTunnelServiceUrl = `http://localhost:${tunnelPort}`;
export const customUiSignInUrl = process.env.CUSTOM_UI_SIGN_IN_URL ?? 'http://127.0.0.1:3000';

export const appId = 'demo-app';
export const redirectUri = appendPath(new URL(logtoExperienceUrl), appId).href;
