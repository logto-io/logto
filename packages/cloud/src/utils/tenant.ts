import { getManagementApiResourceIndicator } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

export const getTenantIdFromManagementApiIndicator = (indicator: string) => {
  const toMatch = '^' + getManagementApiResourceIndicator('([^.]*)') + '$';
  const url = trySafe(() => new URL(indicator));

  return url && new RegExp(toMatch).exec(url.href)?.[1];
};
