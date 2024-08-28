import AdmZip from 'adm-zip';
import chalk from 'chalk';

import { consoleLog } from '../../utils.js';

import { CachedConfig } from './cached-config.js';

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

type FetchAccessToken = (
  appId: string,
  appSecret: string,
  endpoint: string
) => Promise<TokenResponse>;

type Args = {
  appId: string;
  appSecret: string;
  endpoint: string;
  experiencePath: string;
  verbose: boolean;
};

export const deployToLogtoCloud = async ({
  appId,
  appSecret,
  endpoint,
  experiencePath,
  verbose,
}: Args) => {
  if (verbose) {
    consoleLog.info('Zipping files...');
  }
  const zipBuffer = await zipFiles(experiencePath);
  if (verbose) {
    consoleLog.info('✅ Zipping completed.');
  }

  const form = new FormData();
  const blob = new Blob([zipBuffer], { type: 'application/zip' });
  const endpointUrl = new URL(endpoint);
  const tenantId = getTenantIdFromEndpointUri(endpointUrl.href);
  const timestamp = Math.floor(Date.now() / 1000);
  form.append('file', blob, `custom-ui-${tenantId}-${timestamp}.zip`);

  const accessToken = await getAccessToken(appId, appSecret, endpointUrl.href, verbose);

  try {
    if (verbose) {
      consoleLog.info('Uploading zip...');
    }
    const uploadResponse = await fetch(
      `${endpointUrl.href}api/sign-in-exp/default/custom-ui-assets`,
      {
        method: 'POST',
        body: form,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`Request error: [${uploadResponse.status}] ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json<{ customUiAssetId: string }>();

    if (verbose) {
      consoleLog.info(`[${uploadResponse.status}] ${chalk.cyan(uploadResult)}`);
      consoleLog.info('✅ Upload completed.');
    }

    if (verbose) {
      consoleLog.info('Saving changes to your tenant...');
    }
    const patchResponse = await fetch(`${endpointUrl.href}api/sign-in-exp`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customUiAssets: { id: uploadResult.customUiAssetId, createdAt: timestamp },
      }),
    });

    if (!patchResponse.ok) {
      throw new Error(`Request error: [${patchResponse.status}] ${patchResponse.statusText}`);
    }

    const patchResult = await patchResponse.json();

    if (verbose) {
      consoleLog.info(`[${patchResponse.status}] ${chalk.cyan(patchResult)}`);
      consoleLog.info('✅ Changes saved.');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    consoleLog.fatal(chalk.red(errorMessage));
  }
};

const zipFiles = async (path: string): Promise<Uint8Array> => {
  const zip = new AdmZip();
  await zip.addLocalFolderPromise(path, {});
  return zip.toBuffer();
};

export const getAccessToken = async (
  appId: string,
  appSecret: string,
  endpoint: string,
  verbose: boolean
): Promise<string> => {
  const cachedConfig = await CachedConfig.load();

  const [cachedAccessToken, cachedExpiresAt] = await Promise.all([
    cachedConfig.get('accessToken'),
    cachedConfig.get('expiresAt'),
  ]);

  if (cachedAccessToken && cachedExpiresAt && Date.now() < Number(cachedExpiresAt)) {
    return cachedAccessToken;
  }

  const tokenResponse = await fetchAccessTokenFromLogto(appId, appSecret, endpoint);

  if (verbose) {
    consoleLog.info('Token exchange response:', tokenResponse);
  }

  await cachedConfig.set('accessToken', tokenResponse.access_token);
  await cachedConfig.set('expiresAt', (Date.now() + tokenResponse.expires_in * 1000).toString());

  return tokenResponse.access_token;
};

const fetchAccessTokenFromLogto: FetchAccessToken = async (appId, appSecret, endpoint) => {
  const tokenEndpoint = new URL('/oidc/token', endpoint).href;
  const managementApiResource = getManagementApiResourceFromEndpointUri(endpoint);

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      resource: managementApiResource,
      scope: 'all',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch access token: ${response.statusText}`);
  }

  return response.json<TokenResponse>();
};

const getTenantIdFromEndpointUri = (endpoint: string) => {
  return new URL(endpoint).hostname.split('.')[0];
};

const getManagementApiResourceFromEndpointUri = (endpoint: string) => {
  const tenantId = getTenantIdFromEndpointUri(endpoint);

  // This resource URI is fixed to `logto.app` for all environments (prod, staging, and dev)
  return `https://${tenantId}.logto.app/api`;
};
