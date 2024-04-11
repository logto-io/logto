import type { CommandModule } from 'yargs';

import { createPoolAndDatabaseIfNeeded } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

import { seedOgcio } from './ogcio.js';

export type OgcioParams = {
  apiIndicator: string;
  appRedirectUri: string;
  appLogoutRedirectUri: string;
};

type UnknownOgcioParams = {
  apiIndicator?: unknown;
  appRedirectUri?: unknown;
  appLogoutRedirectUri?: unknown;
};

const isValidUrl = (inputParam: string): boolean => {
  try {
    const _url = new URL(inputParam);
    return true;
  } catch {
    return false;
  }
};

const isValidParam = (inputParam?: unknown): inputParam is string => {
  return (
    inputParam !== undefined &&
    typeof inputParam === 'string' &&
    inputParam.length > 0 &&
    isValidUrl(inputParam)
  );
};

const checkParams = (inputParams: UnknownOgcioParams): Required<OgcioParams> => {
  const { apiIndicator, appRedirectUri, appLogoutRedirectUri } = inputParams;
  if (!isValidParam(apiIndicator)) {
    throw new Error('apiIndicator must be set');
  }
  if (!isValidParam(appRedirectUri)) {
    throw new Error('appRedirectUri must be set');
  }
  if (!isValidParam(appLogoutRedirectUri)) {
    throw new Error('appLogoutRedirectUri must be set');
  }

  return { apiIndicator, appRedirectUri, appLogoutRedirectUri };
};

const ogcio: CommandModule<Partial<OgcioParams>> = {
  command: 'ogcio',
  describe: 'Seed OGCIO data',
  builder: (yargs) =>
    yargs
      .option('api-indicator', {
        describe: 'The root url for the seeded API resource',
        type: 'string',
        default: 'http://localhost:8001',
      })
      .option('app-redirect-uri', {
        describe: 'The callback url to set for the seeded application',
        type: 'string',
        default: 'http://localhost:3001/callback',
      })
      .option('app-logout-redirect-uri', {
        describe: 'The callback url to set for the seeded application',
        type: 'string',
        default: 'http://localhost:3001',
      }),
  handler: async ({ apiIndicator, appRedirectUri, appLogoutRedirectUri }) => {
    const params = checkParams({ apiIndicator, appRedirectUri, appLogoutRedirectUri });
    const pool = await createPoolAndDatabaseIfNeeded();
    try {
      await seedOgcio(pool, params);
    } catch (error: unknown) {
      consoleLog.error(error);
      throw error;
    } finally {
      await pool.end();
    }
  },
};

export default ogcio;
