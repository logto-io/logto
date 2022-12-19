import type { Log } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';

import { authedAdminApi } from './api.js';

// eslint-disable-next-line unicorn/prevent-abbreviations
export const getLogs = (params?: URLSearchParams) =>
  authedAdminApi.get('logs?' + conditionalString(params?.toString())).json<Log[]>();

export const getLog = (logId: string) => authedAdminApi.get(`logs/${logId}`).json<Log>();
