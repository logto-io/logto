import { createVerify, X509Certificate } from 'node:crypto';

import { SsoProviderName } from '@logto/schemas';
import { HTTPError } from 'ky';

import { metadataXml } from '#src/__mocks__/sso-connectors-mock.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureDisabledTest, devFeatureTest, randomString } from '#src/utils.js';

const rsaSha256AlgorithmUri = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
const rsaSha512AlgorithmUri = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512';

const digestAlgorithms = new Map([
  [rsaSha256AlgorithmUri, 'RSA-SHA256'],
  [rsaSha512AlgorithmUri, 'RSA-SHA512'],
]);

/**
 * Verify the SAML redirect-binding signature of the authorization URI against a certificate. The
 * signed octet string is `SAMLRequest=..[&RelayState=..]&SigAlg=..` (URL-encoded, in that order,
 * `&Signature=` appended after it); the signature is RSASSA-PKCS1-v1_5 with the `SigAlg` digest.
 */
const verifyRedirectSignature = (authorizationUri: string, certificate: string): boolean => {
  const [signedUrl, encodedSignature] = authorizationUri.split('&Signature=');
  const signatureAlgorithm = new URL(authorizationUri).searchParams.get('SigAlg');
  const digestAlgorithm = signatureAlgorithm ? digestAlgorithms.get(signatureAlgorithm) : undefined;

  if (!signedUrl || !encodedSignature || !digestAlgorithm) {
    return false;
  }

  return createVerify(digestAlgorithm)
    .update(signedUrl.slice(signedUrl.indexOf('SAMLRequest=')))
    .verify(
      new X509Certificate(certificate).publicKey,
      decodeURIComponent(encodedSignature),
      'base64'
    );
};

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

  const patchSigningKey = async (keyId: string, active: boolean) =>
    ssoConnectorApi.updateSigningKeyStatus(ssoConnectorApi.firstConnectorId!, keyId, active);

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

    devFeatureTest.it('should reject enabling signAuthnRequest without an active key', async () => {
      await expectRejects(
        ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
          config: { metadata: metadataXml, signAuthnRequest: true },
        }),
        { code: 'single_sign_on.active_signing_key_required', status: 400 }
      );
    });

    devFeatureTest.it(
      'should sign the AuthnRequest after enabling with an active key',
      async () => {
        const connectorId = ssoConnectorApi.firstConnectorId!;
        const key = await ssoConnectorApi.createSigningKey(connectorId, true);
        expect(key.active).toBe(true);

        await ssoConnectorApi.update(connectorId, {
          config: { metadata: metadataXml, signAuthnRequest: true },
        });

        const authorizationUri = await getAuthorizationUri();
        expect(authorizationUri).toContain('Signature=');
        expect(authorizationUri).toContain('SigAlg=');
      }
    );

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

    devFeatureTest.it(
      'should treat a config patch that omits the flag as disabling, and resume signing on re-enable',
      async () => {
        // Re-enable signing (the previous test disabled it).
        await ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
          config: { metadata: metadataXml, signAuthnRequest: true },
        });
        expect(await getAuthorizationUri()).toContain('Signature=');

        // A config-bearing patch without the flag replaces the whole config, so signing turns off;
        // the keys are retained (deletion only happens via the dedicated signing-key routes).
        await ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
          config: { metadata: metadataXml },
        });
        expect(await getAuthorizationUri()).not.toContain('Signature=');

        // Re-enabling resumes signing with the retained key.
        await ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
          config: { metadata: metadataXml, signAuthnRequest: true },
        });
        expect(await getAuthorizationUri()).toContain('Signature=');
      }
    );

    devFeatureTest.it('should reject creating a connector with signAuthnRequest on', async () => {
      // A new connector cannot have signing keys yet, so the flag can never be enabled on create.
      await expectRejects(
        ssoConnectorApi.create({
          providerName: SsoProviderName.SAML,
          connectorName: `test-saml-signed-${randomString()}`,
          domains: [`bar${randomString()}.com`],
          config: { metadata: metadataXml, signAuthnRequest: true },
          syncProfile: true,
        }),
        { code: 'single_sign_on.active_signing_key_required', status: 400 }
      );
    });

    devFeatureTest.it(
      'should create a connector with signAuthnRequest explicitly off',
      async () => {
        const created = await ssoConnectorApi.create({
          providerName: SsoProviderName.SAML,
          connectorName: `test-saml-unsigned-${randomString()}`,
          domains: [`bar${randomString()}.com`],
          config: { metadata: metadataXml, signAuthnRequest: false },
          syncProfile: true,
        });

        expect(created.config).toHaveProperty('signAuthnRequest', false);
      }
    );

    devFeatureTest.it('should support graceful rotation via the signing-key routes', async () => {
      const connectorId = ssoConnectorApi.firstConnectorId!;
      // Re-enable signing — the key created earlier is still active, so the validation passes.
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
      const expectedError = { code: 'connector.not_found', status: 404 };

      await Promise.all([
        expectRejects(ssoConnectorApi.getSigningKeys(id), expectedError),
        expectRejects(ssoConnectorApi.createSigningKey(id, true), expectedError),
        expectRejects(
          ssoConnectorApi.updateSigningKeyStatus(id, 'unknown-key-id', true),
          expectedError
        ),
        expectRejects(ssoConnectorApi.deleteSigningKey(id, 'unknown-key-id'), expectedError),
      ]);
    });

    devFeatureTest.it(
      'should keep the active key when the toggle is turned off and reuse it on re-enable',
      async () => {
        const connectorId = ssoConnectorApi.firstConnectorId!;
        await ssoConnectorApi.update(connectorId, {
          config: { metadata: metadataXml, signAuthnRequest: true },
        });
        const [keyBefore] = await ssoConnectorApi.getSigningKeys(connectorId);

        // Toggle off: signing stops but the key stays active — the IdP-registered cert is kept.
        await ssoConnectorApi.update(connectorId, {
          config: { metadata: metadataXml, signAuthnRequest: false },
        });
        const [keyWhileOff] = await ssoConnectorApi.getSigningKeys(connectorId);
        expect(keyWhileOff?.id).toBe(keyBefore?.id);
        expect(keyWhileOff?.active).toBe(true);
        expect(await getAuthorizationUri()).not.toContain('Signature=');

        // Re-enable: signing resumes with the same key.
        await ssoConnectorApi.update(connectorId, {
          config: { metadata: metadataXml, signAuthnRequest: true },
        });
        const [keyAfter] = await ssoConnectorApi.getSigningKeys(connectorId);
        expect(keyAfter?.id).toBe(keyBefore?.id);
        expect(await getAuthorizationUri()).toContain('Signature=');
      }
    );

    devFeatureTest.it(
      'should reject deactivating the active key while signing is enabled',
      async () => {
        const connectorId = ssoConnectorApi.firstConnectorId!;
        // Explicit setup so the guard is exercised regardless of the previous test's state.
        await ssoConnectorApi.update(connectorId, {
          config: { metadata: metadataXml, signAuthnRequest: true },
        });
        const [key] = await ssoConnectorApi.getSigningKeys(connectorId);
        expect(key?.active).toBe(true);

        await expectRejects(ssoConnectorApi.updateSigningKeyStatus(connectorId, key!.id, false), {
          code: 'single_sign_on.can_not_deactivate_signing_key_in_use',
          status: 400,
        });

        // The toggle and the key are untouched, and signing continues.
        const { config } = await ssoConnectorApi.getSsoConnectorById(connectorId);
        expect(config).toHaveProperty('signAuthnRequest', true);
        const [keyAfter] = await ssoConnectorApi.getSigningKeys(connectorId);
        expect(keyAfter?.active).toBe(true);
        expect(await getAuthorizationUri()).toContain('Signature=');
      }
    );

    devFeatureTest.it(
      'should deactivate after disabling signing, and gate re-enabling on activation',
      async () => {
        const connectorId = ssoConnectorApi.firstConnectorId!;
        // Disable signing first — then the still-active key can be deactivated.
        await ssoConnectorApi.update(connectorId, {
          config: { metadata: metadataXml, signAuthnRequest: false },
        });
        const [key] = await ssoConnectorApi.getSigningKeys(connectorId);
        const deactivatedKey = await ssoConnectorApi.updateSigningKeyStatus(
          connectorId,
          key!.id,
          false
        );
        expect(deactivatedKey.active).toBe(false);

        // Re-enabling is rejected while no key is active — the config never creates keys.
        await expectRejects(
          ssoConnectorApi.update(connectorId, {
            config: { metadata: metadataXml, signAuthnRequest: true },
          }),
          { code: 'single_sign_on.active_signing_key_required', status: 400 }
        );

        // Activating the retained key (same IdP-registered certificate) unblocks the toggle.
        await ssoConnectorApi.updateSigningKeyStatus(connectorId, key!.id, true);
        await ssoConnectorApi.update(connectorId, {
          config: { metadata: metadataXml, signAuthnRequest: true },
        });

        const keys = await ssoConnectorApi.getSigningKeys(connectorId);
        expect(keys).toHaveLength(1);
        expect(keys[0]?.id).toBe(key?.id);
        expect(keys[0]?.active).toBe(true);
        expect(await getAuthorizationUri()).toContain('Signature=');
      }
    );

    devFeatureTest.it('should treat a same-state signing-key patch as a no-op', async () => {
      const connectorId = ssoConnectorApi.firstConnectorId!;
      const [activeKey] = await ssoConnectorApi.getSigningKeys(connectorId);
      expect(activeKey?.active).toBe(true);

      // Re-activating the active key succeeds without a state change.
      const { active: reactivated } = await patchSigningKey(activeKey!.id, true);
      expect(reactivated).toBe(true);

      // Deactivating an already-inactive key while signing is enabled must not trip the in-use
      // guard — the guard only protects the active key.
      const stagedKey = await ssoConnectorApi.createSigningKey(connectorId);
      const { active: stagedActive } = await patchSigningKey(stagedKey.id, false);
      expect(stagedActive).toBe(false);

      await ssoConnectorApi.deleteSigningKey(connectorId, stagedKey.id);
      expect(await getAuthorizationUri()).toContain('Signature=');
    });

    devFeatureTest.it('should return 404 for an unknown or foreign key id', async () => {
      const connectorId = ssoConnectorApi.firstConnectorId!;
      const [activeKey] = await ssoConnectorApi.getSigningKeys(connectorId);
      const expectedError = { code: 'entity.not_found', status: 404 };

      await Promise.all([
        expectRejects(
          ssoConnectorApi.updateSigningKeyStatus(connectorId, 'unknown-key-id', true),
          expectedError
        ),
        expectRejects(
          ssoConnectorApi.deleteSigningKey(connectorId, 'unknown-key-id'),
          expectedError
        ),
      ]);

      // A key must not be reachable through another connector's path.
      const { id: otherConnectorId } = await ssoConnectorApi.createMockSamlConnector([
        `baz${randomString()}.com`,
      ]);
      expect(await ssoConnectorApi.getSigningKeys(otherConnectorId)).toEqual([]);
      await Promise.all([
        expectRejects(
          ssoConnectorApi.updateSigningKeyStatus(otherConnectorId, activeKey!.id, false),
          expectedError
        ),
        expectRejects(
          ssoConnectorApi.deleteSigningKey(otherConnectorId, activeKey!.id),
          expectedError
        ),
      ]);
    });

    devFeatureTest.it('should sign with the configured signature algorithm', async () => {
      const connectorId = ssoConnectorApi.firstConnectorId!;

      await ssoConnectorApi.update(connectorId, {
        config: {
          metadata: metadataXml,
          signAuthnRequest: true,
          requestSignatureAlgorithm: rsaSha512AlgorithmUri,
        },
      });
      const [activeKey] = await ssoConnectorApi.getSigningKeys(connectorId);
      const sha512AuthorizationUri = await getAuthorizationUri();
      expect(new URL(sha512AuthorizationUri).searchParams.get('SigAlg')).toBe(
        rsaSha512AlgorithmUri
      );
      expect(verifyRedirectSignature(sha512AuthorizationUri, activeKey!.certificate)).toBe(true);

      // A config patch omitting the field removes it and falls back to the default algorithm.
      await ssoConnectorApi.update(connectorId, {
        config: { metadata: metadataXml, signAuthnRequest: true },
      });
      expect(new URL(await getAuthorizationUri()).searchParams.get('SigAlg')).toBe(
        rsaSha256AlgorithmUri
      );
    });

    devFeatureTest.it('should reject a signature algorithm outside the allowlist', async () => {
      await expectRejects(
        ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
          config: {
            metadata: metadataXml,
            signAuthnRequest: true,
            requestSignatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
          },
        }),
        { code: 'connector.invalid_config', status: 400 }
      );
    });

    devFeatureTest.it(
      'should produce a signature that verifies against the served certificate, also after rotation',
      async () => {
        const connectorId = ssoConnectorApi.firstConnectorId!;
        const [[activeKey], authorizationUri] = await Promise.all([
          ssoConnectorApi.getSigningKeys(connectorId),
          getAuthorizationUri(),
        ]);
        expect(activeKey?.active).toBe(true);
        expect(verifyRedirectSignature(authorizationUri, activeKey!.certificate)).toBe(true);

        // A create-active takeover switches signing to the new key immediately.
        const takeoverKey = await ssoConnectorApi.createSigningKey(connectorId, true);
        const rotatedAuthorizationUri = await getAuthorizationUri();
        expect(verifyRedirectSignature(rotatedAuthorizationUri, takeoverKey.certificate)).toBe(
          true
        );
        expect(verifyRedirectSignature(rotatedAuthorizationUri, activeKey!.certificate)).toBe(
          false
        );
      }
    );
  });

  devFeatureDisabledTest.describe('with dev features disabled', () => {
    devFeatureDisabledTest.it(
      'should strip the signing fields from the config and keep the request unsigned',
      async () => {
        const updated = await ssoConnectorApi.update(ssoConnectorApi.firstConnectorId!, {
          config: {
            metadata: metadataXml,
            signAuthnRequest: true,
            requestSignatureAlgorithm: rsaSha512AlgorithmUri,
          },
        });

        expect(updated.config).not.toHaveProperty('signAuthnRequest');
        expect(updated.config).not.toHaveProperty('requestSignatureAlgorithm');
        expect(await getAuthorizationUri()).not.toContain('Signature=');
      }
    );

    devFeatureDisabledTest.it(
      'should strip the signing fields when creating a connector',
      async () => {
        // With dev features enabled the same request is rejected instead (no active key exists).
        const created = await ssoConnectorApi.create({
          providerName: SsoProviderName.SAML,
          connectorName: `test-saml-dev-off-${randomString()}`,
          domains: [`qux${randomString()}.com`],
          config: {
            metadata: metadataXml,
            signAuthnRequest: true,
            requestSignatureAlgorithm: rsaSha512AlgorithmUri,
          },
          syncProfile: true,
        });

        expect(created.config).not.toHaveProperty('signAuthnRequest');
        expect(created.config).not.toHaveProperty('requestSignatureAlgorithm');
      }
    );

    devFeatureDisabledTest.it('should not mount the signing-key routes', async () => {
      // An unmounted route 404s with no Logto error body (which `expectRejects` would need); a
      // mounted route would return 200 here.
      const response = await ssoConnectorApi
        .getSigningKeys(ssoConnectorApi.firstConnectorId!)
        .catch((error: unknown) => error);

      expect(response).toBeInstanceOf(HTTPError);
      expect(response instanceof HTTPError && response.response.status).toBe(404);
    });
  });
});
