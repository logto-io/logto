import type { AccountTrustedDeviceResponse } from '@logto/schemas';

import { getVerificationRecordHeaders } from './account';
import { createAuthenticatedKy } from './base-ky';

export const getTrustedDevices = async (
  accessToken: string,
  verificationRecordId: string | undefined
): Promise<AccountTrustedDeviceResponse[]> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/trusted-devices', {
      headers: getVerificationRecordHeaders(verificationRecordId),
    })
    .json<AccountTrustedDeviceResponse[]>();
};

export const removeTrustedDevice = async (
  accessToken: string,
  verificationRecordId: string | undefined,
  trustedDeviceId: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(
    `/api/my-account/trusted-devices/${trustedDeviceId}`,
    {
      headers: getVerificationRecordHeaders(verificationRecordId),
    }
  );
};
