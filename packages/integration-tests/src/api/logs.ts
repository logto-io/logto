import type { Log } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const getLogs = () => authedAdminApi.get('logs').json<Log[]>();

export const getLog = (logId: string) => authedAdminApi.get(`logs/${logId}`).json<Log>();
