import { type SignInExperience, type Translation, type SsoConnectorMetadata } from '@logto/schemas';
import { HTTPError } from 'ky';

import api, { adminTenantApi, authedAdminApi } from '#src/api/api.js';
import { updateSignInExperience } from '#src/api/index.js';
import { createSsoConnector, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { newOidcSsoConnectorPayload } from '#src/constants.js';
import { generateSsoConnectorName } from '#src/utils.js';

describe('.well-known api', () => {
  it('should return tenant endpoint URL for any given tenant id', async () => {
    const { user } = await adminTenantApi.get(`.well-known/endpoints/123`).json<{ user: string }>();
    expect(user).not.toBeNull();
  });

  it('should not found API route in non-admin tenant', async () => {
    const response = await api.get('.well-known/endpoints/123').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status === 404).toBe(true);
  });

  it('should return request id in headers', async () => {
    const { headers } = await adminTenantApi.get(`.well-known/endpoints/123`);
    expect(headers.has('logto-core-request-id')).toBe(true);
  });

  it('get /.well-known/sign-in-exp for console', async () => {
    const response = await adminTenantApi.get('.well-known/sign-in-exp').json<SignInExperience>();

    expect(response).toMatchObject({
      signUp: {
        identifiers: ['username'],
        password: true,
        verify: false,
      },
      signIn: {
        methods: [
          {
            identifier: 'username',
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
      signInMode: 'SignInAndRegister',
    });
  });

  // Also test for Redis cache invalidation
  it('should be able to return updated phrases', async () => {
    const and = '&';
    const original = await api
      .get('.well-known/phrases?lng=en')
      .json<{ translation: Translation }>();

    expect(original.translation.list).not.toHaveProperty('and', and);

    await authedAdminApi.put('custom-phrases/en', { json: { list: { and } } });
    const updated = await api
      .get('.well-known/phrases?lng=en')
      .json<{ translation: Translation }>();
    expect(updated.translation.list).toHaveProperty('and', and);
  });

  describe('sso connectors in sign-in experience', () => {
    // Enabled single-sign-on
    beforeAll(async () => {
      await updateSignInExperience({
        singleSignOnEnabled: true,
      });
    });

    it('should get the sso connectors in sign-in experience', async () => {
      const { id } = await createSsoConnector({
        ...newOidcSsoConnectorPayload,
        connectorName: generateSsoConnectorName(),
      });

      const signInExperience = await api
        .get('.well-known/sign-in-exp')
        .json<SignInExperience & { ssoConnectors: SsoConnectorMetadata[] }>();

      expect(signInExperience.ssoConnectors.length).toBeGreaterThan(0);

      const newCreatedConnector = signInExperience.ssoConnectors.find(
        (connector) => connector.id === id
      );

      expect(newCreatedConnector).toMatchObject({
        id,
        connectorName: newOidcSsoConnectorPayload.branding.displayName,
        logo: newOidcSsoConnectorPayload.branding.logo,
        darkLogo: newOidcSsoConnectorPayload.branding.darkLogo,
      });

      await deleteSsoConnectorById(id);
    });

    it('should filter out the sso connectors with invalid config', async () => {
      const { id } = await createSsoConnector({
        ...newOidcSsoConnectorPayload,
        connectorName: generateSsoConnectorName(),
        config: undefined,
      });

      const signInExperience = await api
        .get('.well-known/sign-in-exp')
        .json<SignInExperience & { ssoConnectors: SsoConnectorMetadata[] }>();

      const { ssoConnectors } = signInExperience;

      expect(ssoConnectors.find((connector) => connector.id === id)).toBeUndefined();

      await deleteSsoConnectorById(id);
    });

    it('should filter out the sso connectors with empty domains', async () => {
      const { id } = await createSsoConnector({
        ...newOidcSsoConnectorPayload,
        connectorName: generateSsoConnectorName(),
        domains: [],
      });

      const signInExperience = await api
        .get('.well-known/sign-in-exp')
        .json<SignInExperience & { ssoConnectors: SsoConnectorMetadata[] }>();

      const { ssoConnectors } = signInExperience;

      expect(ssoConnectors.find((connector) => connector.id === id)).toBeUndefined();

      await deleteSsoConnectorById(id);
    });

    it('should return empty array if single-sign-on is disabled', async () => {
      await updateSignInExperience({
        singleSignOnEnabled: false,
      });

      const { id } = await createSsoConnector({
        ...newOidcSsoConnectorPayload,
        connectorName: generateSsoConnectorName(),
      });

      const signInExperience = await api
        .get('.well-known/sign-in-exp')
        .json<SignInExperience & { ssoConnectors: SsoConnectorMetadata[] }>();

      expect(signInExperience.ssoConnectors.length).toBe(0);

      await deleteSsoConnectorById(id);
    });
  });
});
