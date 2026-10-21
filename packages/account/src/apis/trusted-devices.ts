import type { AccountTrustedDeviceResponse } from '@logto/schemas';

import { verificationRecordIdHeader } from './account';
import { createAuthenticatedKy } from './base-ky';

export const getTrustedDevices = async (
  accessToken: string,
  verificationRecordId: string
): Promise<AccountTrustedDeviceResponse[]> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/trusted-devices', {
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    })
    .json<AccountTrustedDeviceResponse[]>();
};

export const removeTrustedDevice = async (
  accessToken: string,
  verificationRecordId: string,
  trustedDeviceId: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(
    `/api/my-account/trusted-devices/${trustedDeviceId}`,
    {
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    }
  );
};
