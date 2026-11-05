import saml from 'samlify';

import { generateKeyPairAndCertificate } from '#src/libraries/saml-application/utils.js';

import { SsoConnectorError } from '../types/error.js';

import {
  attributeMappingPostProcessor,
  getExtendedUserInfoFromRawUserProfile,
  getPemCertificate,
  handleSamlAssertion,
} from './utils.js';

const expectedDefaultAttributeMapping = {
  id: 'nameID',
  email: 'email',
  name: 'name',
};

describe('attributeMappingPostProcessor', () => {
  it('should fallback to `expectedDefaultAttributeMapping` if no other attribute mapping is specified', () => {
    expect(attributeMappingPostProcessor()).toEqual(expectedDefaultAttributeMapping);
    expect(attributeMappingPostProcessor({})).toEqual(expectedDefaultAttributeMapping);
  });

  it('should overwrite specified attributes of `expectedDefaultAttributeMapping`', () => {
    expect(attributeMappingPostProcessor({ id: 'sub' })).toEqual({
      ...expectedDefaultAttributeMapping,
      id: 'sub',
    });
  });
});

describe('getExtendedUserInfoFromRawUserProfile', () => {
  it('should correctly map even if attributeMap is not specified', () => {
    const keyMapping = attributeMappingPostProcessor();
    const rawUserProfile = {
      id: 'foo',
      picture: 'pic.png',
    };
    expect(getExtendedUserInfoFromRawUserProfile(rawUserProfile, keyMapping)).toEqual(
      rawUserProfile
    );
  });

  it('should correctly map with specific fields specified', () => {
    const keyMapping = attributeMappingPostProcessor({ id: 'sub' });
    const rawUserProfile = {
      sub: 'foo',
      avatar: 'pic.png',
    };
    expect(getExtendedUserInfoFromRawUserProfile(rawUserProfile, keyMapping)).toEqual({
      id: 'foo',
      avatar: 'pic.png',
    });
  });
});

const testCertificate =
  '-----BEGIN CERTIFICATE-----\nMIIC8DCCAdigAwIBAgIQcu5YCNUIL6JNotFNdirF2DANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQDEylNaWNyb3NvZnQgQXp1cmUgRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yMzEwMjUwODAyMDNaFw0yNjEwMjUwODAyMDNaMDQxMjAwBgNVBAMTKU1pY3Jvc29mdCBBenVyZSBGZWRlcmF0ZWQgU1NPIENlcnRpZmljYXRlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2EC5TZmW2ePPI0Od2Z3qFykouY/R8SBVJDD9xUcAIocMSqMLsxqd9ydkjaNC+QLbBUnpCvUd7+7ZyVcABbr5ixIMU+yxKIoZQdchECyasrR4HHXHXMeijQ8ziyF3Ys1yRB+iVQd2wZI+26pXlq9/bmT/keqMqdbAFD78QAYVF0LniL+sQav9Y0tsgrqXaE0GzqpTUsUfEcc1kynIQQG4ltFAkMTqaDhgw44S1GErjYC91dPEZMj4Ywwf1FIfnNJaRZoG77F3SlWUg345z/kAHBzNKjFMq3deobCHDZCZBJ6a+ABzgqdunUo4xBFG/YHNjjGkZEImALwp+P45mF5OLQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAK7s967KnFm0d7R1HpTHhr6D+L/X2Ejmgawo2HlkFLsHXPgGkeogrXl0Fw6NImJ+Zo/ChE2Vb8ZeYoEz5mdAYc0hK4k4UWJkv3yZ0GPKOzEcIWZ8Q8WAKqqWnzaO8NmZKpdc/sk8PluKH/BJ7IjEHZUgzhmuRGuJGJhVn2EPLXFIxBubyRlyMhBEZvX4syeeiCwGzvZY9CoTUPqftlrvc1xs78GFN+8cT2+B0vjcbifMkZ1Hq0iPQLN/LotM1qGbSVu/OFhuA+8mnp3Acw3XNZPOy9dZdNiVBF8ZoUz0rAC64dKYROPEDJhBTF30UzDcq6lfLA9KAgzEzupAxB8D4N\n-----END CERTIFICATE-----';

describe('getPemCertificate', () => {
  it('should not throw error with a valid certificate', () => {
    expect(() => getPemCertificate(testCertificate)).not.toThrow();
  });
});

const { privateKey, certificate } = await generateKeyPairAndCertificate(1);

describe('handleSamlAssertion', () => {
  const idpEntityId = 'https://idp.example.com';
  const defaultSpEntityId = 'https://tenant.logto.app/enterprise-sso/connector';
  const spEntityId = 'https://auth.example.com/enterprise-sso/connector';
  const otherCustomDomainSpEntityId = 'https://login.example.com/enterprise-sso/connector';
  const otherSpEntityId = 'https://other-app.example.com';
  const acsUrl = 'https://auth.example.com/api/authn/single-sign-on/saml/connector';

  // eslint-disable-next-line new-cap -- Samlify exposes capitalized entity factories.
  const identityProvider = saml.IdentityProvider({
    entityID: idpEntityId,
    privateKey,
    signingCert: certificate,
    singleSignOnService: [
      { Binding: saml.Constants.BindingNamespace.Redirect, Location: `${idpEntityId}/sso` },
    ],
  });
  // eslint-disable-next-line new-cap -- Samlify exposes capitalized entity factories.
  const responseServiceProvider = saml.ServiceProvider({
    entityID: spEntityId,
    assertionConsumerService: [{ Binding: saml.Constants.BindingNamespace.Post, Location: acsUrl }],
  });

  const createSamlResponse = async (audiences: string[]) => {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
    const audienceRestriction =
      audiences.length > 0
        ? `<saml:AudienceRestriction>${audiences
            .map((audience) => `<saml:Audience>${audience}</saml:Audience>`)
            .join('')}</saml:AudienceRestriction>`
        : '';

    const { context } = await identityProvider.createLoginResponse(
      responseServiceProvider,
      { extract: {} },
      'post',
      {},
      (template) => ({
        id: '_response',
        context: saml.SamlLib.replaceTagsByValue(
          template.replace(
            '<saml:AudienceRestriction><saml:Audience>{Audience}</saml:Audience></saml:AudienceRestriction>',
            audienceRestriction
          ),
          {
            ID: '_response',
            AssertionID: '_assertion',
            InResponseTo: '_request',
            Destination: acsUrl,
            SubjectRecipient: acsUrl,
            Issuer: idpEntityId,
            IssueInstant: now.toISOString(),
            StatusCode: saml.Constants.StatusCode.Success,
            ConditionsNotBefore: now.toISOString(),
            ConditionsNotOnOrAfter: fiveMinutesLater,
            SubjectConfirmationDataNotOnOrAfter: fiveMinutesLater,
            NameIDFormat: saml.Constants.namespace.format.emailAddress,
            NameID: 'user@example.com',
            AuthnStatement: '',
            AttributeStatement: '',
          }
        ),
      })
    );

    return context;
  };

  const handle = async (SAMLResponse: string, requestSpEntityId = spEntityId) =>
    handleSamlAssertion(
      { body: { SAMLResponse } },
      identityProvider,
      { entityId: requestSpEntityId, x509Certificate: certificate },
      defaultSpEntityId
    );

  it('should accept the request domain entity ID', async () => {
    await expect(handle(await createSamlResponse([spEntityId]))).resolves.toMatchObject({
      nameID: 'user@example.com',
    });
  });

  it('should accept the default domain entity ID', async () => {
    await expect(handle(await createSamlResponse([defaultSpEntityId]))).resolves.toMatchObject({
      nameID: 'user@example.com',
    });
  });

  it('should accept an audience list that includes an entity ID', async () => {
    await expect(
      handle(await createSamlResponse([otherSpEntityId, defaultSpEntityId]))
    ).resolves.toMatchObject({ nameID: 'user@example.com' });
  });

  it.each([
    ['an audience naming another service provider', [otherSpEntityId]],
    ['the entity ID of another custom domain', [otherCustomDomainSpEntityId]],
    ['the entity ID with a trailing slash', [`${spEntityId}/`]],
    ['the entity ID in a different case', [spEntityId.toUpperCase()]],
    ['an audience list without an entity ID', [otherSpEntityId, `${spEntityId}/`]],
    ['a missing audience', []],
  ])('should reject %s', async (_, audiences) => {
    const error = await handle(await createSamlResponse(audiences)).catch(
      (error: unknown) => error
    );

    expect(error).toBeInstanceOf(SsoConnectorError);
    expect(error).toHaveProperty('data', {
      ssoErrorCode: 'authorization_failed',
      message: 'SAML assertion audience does not match the SP entity ID',
      error: { expected: [spEntityId, defaultSpEntityId], actual: audiences },
    });
  });

  it('should list the default domain entity ID once on the default domain', async () => {
    await expect(
      handle(await createSamlResponse([otherSpEntityId]), defaultSpEntityId)
    ).rejects.toMatchObject({
      data: { error: { expected: [defaultSpEntityId], actual: [otherSpEntityId] } },
    });
  });

  it('should verify the signature before the audience', async () => {
    const tampered = Buffer.from(
      Buffer.from(await createSamlResponse([otherSpEntityId]), 'base64')
        .toString()
        .replace('user@example.com', 'admin@example.com')
    ).toString('base64');

    await expect(handle(tampered)).rejects.toMatchObject({
      data: { ssoErrorCode: 'authorization_failed', message: 'Invalid SAML assertion' },
    });
  });
});
