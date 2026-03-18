import { ApplicationType } from '@logto/schemas';
import ky from 'ky';

import { oidcApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { logtoUrl } from '#src/constants.js';
import { devFeatureTest, randomString } from '#src/utils.js';

type DeviceAuthorizationResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
};

devFeatureTest.describe('device flow shortcut', () => {
  const baseApi = ky.extend({
    prefixUrl: new URL(logtoUrl),
    redirect: 'manual',
    throwHttpErrors: false,
  });

  // eslint-disable-next-line @silverhand/fp/no-let
  let applicationId: string;
  // eslint-disable-next-line @silverhand/fp/no-let
  let clientId: string;

  beforeAll(async () => {
    const application = await createApplication(
      `device-flow-shortcut-${randomString()}`,
      ApplicationType.Native,
      { customClientMetadata: { isDeviceFlow: true } }
    );
    // eslint-disable-next-line @silverhand/fp/no-mutation
    applicationId = application.id;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    clientId = application.id;
  });

  afterAll(async () => {
    await deleteApplication(applicationId);
  });

  it('should rewrite verification_uri to /device in device authorization response', async () => {
    const response = await oidcApi
      .post('device/auth', {
        body: new URLSearchParams({
          client_id: clientId,
          scope: 'openid',
        }),
      })
      .json<DeviceAuthorizationResponse>();

    expect(response.verification_uri).toBe(`${logtoUrl}/device`);
    expect(response.verification_uri_complete).toContain(`${logtoUrl}/device?`);
    expect(response.verification_uri).not.toContain('/oidc/device');
    expect(response.verification_uri_complete).not.toContain('/oidc/device');
  });

  it('should redirect GET /device to /oidc/device when XSRF cookie is absent', async () => {
    const response = await baseApi.get('device');

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/oidc/device');
  });
});
