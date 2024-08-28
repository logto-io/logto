import { appendPath } from '@silverhand/essentials';
import AdmZip from 'adm-zip';
import chalk from 'chalk';
import ora from 'ora';

import { consoleLog } from '../../utils.js';

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

type DeployArgs = {
  auth: string;
  endpoint: string;
  experiencePath: string;
  managementApiResource?: string;
  verbose: boolean;
};

export const deployToLogtoCloud = async ({
  auth,
  endpoint,
  experiencePath,
  managementApiResource,
  verbose,
}: DeployArgs) => {
  const spinner = ora();
  if (verbose) {
    spinner.start('[1/4] Zipping files...');
  }
  const zipBuffer = await zipFiles(experiencePath);
  if (verbose) {
    spinner.succeed('[1/4] Zipping files... Done.');
  }

  try {
    if (verbose) {
      spinner.start('[2/4] Exchanging access token...');
    }
    const endpointUrl = new URL(endpoint);
    const tokenResponse = await getAccessToken(auth, endpointUrl, managementApiResource);
    if (verbose) {
      spinner.succeed('[2/4] Exchanging access token... Done.');
      spinner.succeed(
        `Token exchange response:\n${chalk.gray(JSON.stringify(tokenResponse, undefined, 2))}`
      );
      spinner.start('[3/4] Uploading zip...');
    }
    const accessToken = tokenResponse.access_token;
    const uploadResult = await uploadCustomUiAssets(accessToken, endpointUrl, zipBuffer);

    if (verbose) {
      spinner.succeed('[3/4] Uploading zip... Done.');
      spinner.succeed(
        `Received response:\n${chalk.gray(JSON.stringify(uploadResult, undefined, 2))}`
      );
      spinner.start('[4/4] Saving changes to your tenant...');
    }

    await saveChangesToSie(accessToken, endpointUrl, uploadResult.customUiAssetId);

    if (verbose) {
      spinner.succeed('[4/4] Saving changes to your tenant... Done.');
    }
  } catch (error: unknown) {
    spinner.fail();
    const errorMessage = error instanceof Error ? error.message : String(error);
    consoleLog.fatal(chalk.red(errorMessage));
  }
};

const zipFiles = async (path: string): Promise<Uint8Array> => {
  const zip = new AdmZip();
  await zip.addLocalFolderPromise(path, {});
  return zip.toBuffer();
};

const getAccessToken = async (auth: string, endpoint: URL, managementApiResource?: string) => {
  const tokenEndpoint = appendPath(endpoint, '/oidc/token').href;
  const resource = managementApiResource ?? getManagementApiResourceFromEndpointUri(endpoint);

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(auth).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      resource,
      scope: 'all',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch access token: ${response.statusText}`);
  }

  return response.json<TokenResponse>();
};

const uploadCustomUiAssets = async (accessToken: string, endpoint: URL, zipBuffer: Uint8Array) => {
  const form = new FormData();
  const blob = new Blob([zipBuffer], { type: 'application/zip' });
  const timestamp = Math.floor(Date.now() / 1000);
  form.append('file', blob, `custom-ui-${timestamp}.zip`);

  const uploadResponse = await fetch(
    appendPath(endpoint, '/api/sign-in-exp/default/custom-ui-assets'),
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

  return uploadResponse.json<{ customUiAssetId: string }>();
};

const saveChangesToSie = async (accessToken: string, endpointUrl: URL, customUiAssetId: string) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const patchResponse = await fetch(appendPath(endpointUrl, '/api/sign-in-exp'), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customUiAssets: { id: customUiAssetId, createdAt: timestamp },
    }),
  });

  if (!patchResponse.ok) {
    throw new Error(`Request error: [${patchResponse.status}] ${patchResponse.statusText}`);
  }

  return patchResponse.json();
};

const getTenantIdFromEndpointUri = (endpoint: URL) => {
  const splitted = endpoint.hostname.split('.');
  return splitted.length > 2 ? splitted[0] : 'default';
};

const getManagementApiResourceFromEndpointUri = (endpoint: URL) => {
  const tenantId = getTenantIdFromEndpointUri(endpoint);

  // This resource domain is fixed to `logto.app` for all environments (prod, staging, and dev)
  return `https://${tenantId}.logto.app/api`;
};
