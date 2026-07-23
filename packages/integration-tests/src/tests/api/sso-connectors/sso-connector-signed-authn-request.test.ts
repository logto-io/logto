import { SsoProviderName } from '@logto/schemas';

import { metadataXml } from '#src/__mocks__/sso-connectors-mock.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { devFeatureDisabledTest, devFeatureTest, randomString } from '#src/utils.js';

describe('SAML SSO signed AuthnRequest', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const domain = `foo${randomString()}.com`;
  const state = 'signed_authn_request_state';
  const redirectUri = 'http://localhost:3000/redirect';

  const getAuthorizationUri = async (connectorId = ssoConnectorApi.firstConnectorId!) => {
    const client = await initExperienceClient();
    const { authorizationUri } = await client.getEnterpriseSsoAuthorizationUri(connectorId, {
      redirectUri,
      state,
    });
    return authorizationUri;
  };

  beforeAll(async () => {
    await ssoConnectorApi.createMockSamlConnector([domain]);
    await updateSignInExperience({ singleSignOnEnabled: true });
  });

  afterAll(async () => {
    await ssoConnectorApi.cleanUp();
  });

  devFeatureTest.describe('with dev features enabled', () => {
    devFeatureTest.it('should not sign the AuthnRequest by default', async () => {
      expect(await getAuthorizationUri()).not.toContain('Signature=');
    });

    devFeatureTest.it('should sign the AuthnRequest after enabling signAuthnRequest', async () => {
      await ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
        config: { metadata: metadataXml, signAuthnRequest: true },
      });

      const authorizationUri = await getAuthorizationUri();
      expect(authorizationUri).toContain('Signature=');
      expect(authorizationUri).toContain('SigAlg=');
    });

    devFeatureTest.it('should keep signing when a patch does not touch the config', async () => {
      await ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
        connectorName: `test-saml-renamed-${randomString()}`,
      });

      expect(await getAuthorizationUri()).toContain('Signature=');
    });

    devFeatureTest.it('should stop signing after disabling signAuthnRequest', async () => {
      await ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
        config: { metadata: metadataXml, signAuthnRequest: false },
      });

      expect(await getAuthorizationUri()).not.toContain('Signature=');
    });

    devFeatureTest.it('should sign for a connector created with signAuthnRequest on', async () => {
      const { id } = await ssoConnectorApi.create({
        providerName: SsoProviderName.SAML,
        connectorName: `test-saml-signed-${randomString()}`,
        domains: [`bar${randomString()}.com`],
        config: { metadata: metadataXml, signAuthnRequest: true },
        syncProfile: true,
      });

      expect(await getAuthorizationUri(id)).toContain('Signature=');
    });
  });

  devFeatureDisabledTest.describe('with dev features disabled', () => {
    devFeatureDisabledTest.it(
      'should strip the signing fields from the config and keep the request unsigned',
      async () => {
        const updated = await ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
          config: { metadata: metadataXml, signAuthnRequest: true },
        });

        expect(updated.config).not.toHaveProperty('signAuthnRequest');
        expect(await getAuthorizationUri()).not.toContain('Signature=');
      }
    );
  });
});
