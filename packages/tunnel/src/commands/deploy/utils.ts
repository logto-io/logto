import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

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
  experiencePath?: string;
  zipPath?: string;
  managementApiResource?: string;
  verbose: boolean;
};

export const checkExperienceAndZipPathInputs = async (
  experiencePath?: string,
  zipPath?: string
) => {
  if (zipPath && experiencePath) {
    consoleLog.fatal(
      'You can only specify either `--zip-path` or `--experience-path`. Please check your input and environment variables.'
    );
  }
  if (!zipPath && !experiencePath) {
    consoleLog.fatal(
      'A valid path to your experience asset folder or zip package must be provided. You can specify either `--zip-path` or `--experience-path` options or corresponding environment variables.'
    );
  }
  if (zipPath) {
    if (!existsSync(zipPath)) {
      consoleLog.fatal(`The specified zip file does not exist: ${zipPath}`);
    }

    const zipFile = new AdmZip(zipPath);
    const zipEntries = zipFile.getEntries();
    const hasIndexHtmlInRoot = zipEntries.some(({ entryName }) => {
      const parts = entryName.split('/');
      return parts.length <= 2 && parts.at(-1) === 'index.html';
    });

    if (!hasIndexHtmlInRoot) {
      consoleLog.fatal('The provided zip must contain an "index.html" file in the root directory.');
    }
  }
  if (experiencePath && !existsSync(path.join(experiencePath, 'index.html'))) {
    consoleLog.fatal(`The provided experience path must contain an "index.html" file.`);
  }
};

export const deployToLogtoCloud = async ({
  auth,
  endpoint,
  experiencePath,
  managementApiResource,
  verbose,
  zipPath,
}: DeployArgs) => {
  const spinner = ora();
  if (verbose) {
    spinner.start(`[1/4] ${zipPath ? 'Reading zip' : 'Zipping'} files...`);
  }
  const zipBuffer = await getZipBuffer(experiencePath, zipPath);
  if (verbose) {
    spinner.succeed(`[1/4] ${zipPath ? 'Reading zip' : 'Zipping'} files... Done.`);
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

const getZipBuffer = async (experiencePath?: string, zipPath?: string): Promise<Uint8Array> => {
  if (!experiencePath && !zipPath) {
    consoleLog.fatal('Must specify either `--experience-path` or `--zip-path`.');
  }
  if (zipPath) {
    return readFile(zipPath);
  }
  if (!experiencePath) {
    consoleLog.fatal('Invalid experience path input.');
  }
  const zip = new AdmZip();
  await zip.addLocalFolderPromise(experiencePath, {
    filter: (filename) => !isHiddenEntry(filename),
  });
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
    await throwRequestError(response);
  }

  return response.json<TokenResponse>();
};

const uploadCustomUiAssets = async (accessToken: string, endpoint: URL, zipBuffer: Uint8Array) => {
  const form = new FormData();
  const blob = new Blob([zipBuffer], { type: 'application/zip' });
  const timestamp = Math.floor(Date.now() / 1000);
  form.append('file', blob, `custom-ui-${timestamp}.zip`);

  const response = await fetch(appendPath(endpoint, '/api/sign-in-exp/default/custom-ui-assets'), {
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    await throwRequestError(response);
  }

  return response.json<{ customUiAssetId: string }>();
};

const saveChangesToSie = async (accessToken: string, endpointUrl: URL, customUiAssetId: string) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const response = await fetch(appendPath(endpointUrl, '/api/sign-in-exp'), {
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

  if (!response.ok) {
    await throwRequestError(response);
  }

  return response.json();
};

const throwRequestError = async (response: Response) => {
  const errorDetails = await response.text();
  throw new Error(`[${response.status}] ${errorDetails}`);
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

const isHiddenEntry = (entryName: string) => {
  return entryName.split('/').some((part) => part.startsWith('.'));
};
