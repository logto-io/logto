import { SsoProviderName } from '@logto/schemas';

import { metadataXml } from '#src/__mocks__/sso-connectors-mock.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
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

    devFeatureTest.it('should support graceful rotation via the signing-key routes', async () => {
      const connectorId = ssoConnectorApi.firstConnectorId!;
      // Re-enable signing — the toggle generates a fresh active key.
      await ssoConnectorApi.update(connectorId, {
        config: { metadata: metadataXml, signAuthnRequest: true },
      });

      const [initialKey, ...restKeys] = await ssoConnectorApi.getSigningKeys(connectorId);
      expect(restKeys).toHaveLength(0);
      expect(initialKey?.active).toBe(true);
      expect(initialKey).not.toHaveProperty('privateKey');
      expect(initialKey?.fingerprints.sha256.formatted).toBeTruthy();

      // Stage: create an inactive key alongside the active one; signing is uninterrupted.
      const stagedKey = await ssoConnectorApi.createSigningKey(connectorId);
      expect(stagedKey.active).toBe(false);
      expect(await ssoConnectorApi.getSigningKeys(connectorId)).toHaveLength(2);
      expect(await getAuthorizationUri()).toContain('Signature=');

      // Switch: activating the staged key deactivates the old one; signing continues.
      const activatedKey = await ssoConnectorApi.updateSigningKeyStatus(
        connectorId,
        stagedKey.id,
        true
      );
      expect(activatedKey.active).toBe(true);
      const keysAfterSwitch = await ssoConnectorApi.getSigningKeys(connectorId);
      expect(keysAfterSwitch.find(({ id }) => id === initialKey?.id)?.active).toBe(false);
      expect(await getAuthorizationUri()).toContain('Signature=');

      // Retire: the old inactive key can be deleted; the active key cannot.
      await ssoConnectorApi.deleteSigningKey(connectorId, initialKey!.id);
      expect(await ssoConnectorApi.getSigningKeys(connectorId)).toHaveLength(1);
      await expectRejects(ssoConnectorApi.deleteSigningKey(connectorId, stagedKey.id), {
        code: 'single_sign_on.can_not_delete_active_signing_key',
        status: 400,
      });

      // Create-active: atomically takes over from the currently active key.
      const takeoverKey = await ssoConnectorApi.createSigningKey(connectorId, true);
      expect(takeoverKey.active).toBe(true);
      const finalKeys = await ssoConnectorApi.getSigningKeys(connectorId);
      expect(finalKeys.find(({ id }) => id === stagedKey.id)?.active).toBe(false);
      await ssoConnectorApi.deleteSigningKey(connectorId, stagedKey.id);
      expect(await ssoConnectorApi.getSigningKeys(connectorId)).toHaveLength(1);
      expect(await getAuthorizationUri()).toContain('Signature=');
    });

    devFeatureTest.it('should return 404 for a non-SAML connector', async () => {
      const { id } = await ssoConnectorApi.createMockOidcConnector([`oidc${randomString()}.com`]);

      await expectRejects(ssoConnectorApi.getSigningKeys(id), {
        code: 'connector.not_found',
        status: 404,
      });
    });

    devFeatureTest.it('should fail closed when signing is on but no key is active', async () => {
      const connectorId = ssoConnectorApi.firstConnectorId!;
      const [key] = await ssoConnectorApi.getSigningKeys(connectorId);
      await ssoConnectorApi.updateSigningKeyStatus(connectorId, key!.id, false);

      const client = await initExperienceClient();
      await expectRejects(
        client.getEnterpriseSsoAuthorizationUri(connectorId, { redirectUri, state }),
        { code: 'single_sign_on.sso_signing_unavailable', status: 500 }
      );
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
