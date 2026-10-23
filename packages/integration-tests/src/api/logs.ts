import type { LogResponse } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';

import { authedAdminApi } from './api.js';

export const getAuditLogsResponse = async (params?: URLSearchParams) =>
  authedAdminApi.get('logs?' + conditionalString(params?.toString()));

export const getAuditLogs = async (params?: URLSearchParams) => {
  const response = await getAuditLogsResponse(params);
  return response.json<LogResponse[]>();
};

export const getWebhookRecentLogs = async (hookId: string, params?: URLSearchParams) =>
  authedAdminApi
    .get(`hooks/${hookId}/recent-logs?` + conditionalString(params?.toString()))
    .json<LogResponse[]>();

export const getLog = async (logId: string) =>
  authedAdminApi.get(`logs/${logId}`).json<LogResponse>();
