import {
  buildDeviceFlowPageUrl,
  buildDeviceFlowSuccessPageUrl,
  defaultDeviceCodeTtl,
  deviceFlowConfig,
} from './device-flow.js';

const { jest } = import.meta;

describe('buildDeviceFlowPageUrl', () => {
  it('should build a structured device-flow query from the callback state', () => {
    expect(buildDeviceFlowPageUrl({})).toBe('/device');
  });

  it('should append the shared Experience context for device pages', () => {
    expect(
      buildDeviceFlowPageUrl({
        sharedParams: {
          appId: 'app_123',
          organizationId: 'org_123',
          uiLocales: 'fr-CA fr',
        },
      })
    ).toBe('/device?app_id=app_123&organization_id=org_123&ui_locales=fr-CA+fr');
  });

  it('should append confirm-mode user_code and input-mode error redisplay separately', () => {
    expect(
      buildDeviceFlowPageUrl({
        sharedParams: {
          appId: 'app_123',
          organizationId: 'org_123',
          uiLocales: 'fr-CA fr',
        },
        state: {
          error: 'NoCodeError',
          inputCode: 'raw-code',
        },
      })
    ).toBe(
      '/device?app_id=app_123&organization_id=org_123&ui_locales=fr-CA+fr&input_code=raw-code&error=NoCodeError'
    );
    expect(
      buildDeviceFlowPageUrl({
        sharedParams: {
          appId: 'app_123',
          organizationId: 'org_123',
          uiLocales: 'fr-CA fr',
        },
        state: {
          error: 'NoCodeError',
          userCode: 'ABCD-EFGH',
        },
      })
    ).toBe(
      '/device?app_id=app_123&organization_id=org_123&ui_locales=fr-CA+fr&user_code=ABCD-EFGH&error=NoCodeError'
    );
  });
});

describe('buildDeviceFlowSuccessPageUrl', () => {
  it('should return the success route for the device flow experience page', () => {
    expect(buildDeviceFlowSuccessPageUrl()).toBe('/device/success');
  });
});

describe('defaultDeviceCodeTtl', () => {
  it('should keep the oidc-provider default device-code lifetime', () => {
    expect(defaultDeviceCodeTtl).toBe(600);
  });
});

describe('deviceFlowConfig.userCodeConfirmSource', () => {
  it('should not derive app_id from the oidc client when the page did not specify one', async () => {
    const redirect = jest.fn();
    const setCookie = jest.fn();

    await deviceFlowConfig.userCodeConfirmSource(
      {
        cookies: { set: setCookie },
        oidc: {
          client: { clientId: 'client_123' },
          entities: {
            DeviceCode: {
              params: {
                client_id: 'client_123',
                organization_id: 'org_123',
                ui_locales: 'fr-CA fr',
              },
            },
          },
          session: {
            state: {
              secret: 'secret_123',
            },
          },
        },
        query: {},
        redirect,
      } as never,
      '',
      {},
      {},
      'ABCD-EFGH'
    );

    expect(redirect).toHaveBeenCalledWith(
      '/device?organization_id=org_123&ui_locales=fr-CA+fr&user_code=ABCD-EFGH'
    );
  });
});
