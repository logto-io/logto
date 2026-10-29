import type { AccountTrustedDeviceResponse } from '@logto/schemas';

import { createAuthenticatedKy } from './base-ky';

export const getTrustedDevices = async (
  accessToken: string
): Promise<AccountTrustedDeviceResponse[]> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/trusted-devices')
    .json<AccountTrustedDeviceResponse[]>();
};

export const removeTrustedDevice = async (
  accessToken: string,
  trustedDeviceId: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(
    `/api/my-account/trusted-devices/${trustedDeviceId}`
  );
};
