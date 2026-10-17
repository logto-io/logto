import {
  adminTenantId,
  getCloudApiIndicator,
  CloudScope,
  getManagementApiResourceIndicator,
  getMeApiResourceIndicator,
  PredefinedScope,
} from '@logto/schemas';

import { isCloud } from './env';

export type ApiResource = {
  indicator: string;
  scopes: Record<string, string>;
};

export const getManagementApi = (tenantId: string) =>
  Object.freeze({
    indicator: getManagementApiResourceIndicator(tenantId),
    scopes: PredefinedScope,
  } satisfies ApiResource);

export const meApi = Object.freeze({
  indicator: getMeApiResourceIndicator(isCloud ? window.location.origin : undefined),
  scopes: PredefinedScope,
} satisfies ApiResource);

export const cloudApi = Object.freeze({
  indicator: getCloudApiIndicator(window.location.origin),
  scopes: CloudScope,
} satisfies ApiResource);
