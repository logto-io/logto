import { deflateRawSync, inflateRawSync } from 'node:zlib';

import { BindingType } from '@logto/schemas';
import saml from 'samlify';

import {
  generateKeyPairAndCertificate,
  validateSamlAuthnRequestConfig,
} from '#src/libraries/saml-application/utils.js';

import {
  createMockSamlApplicationDetails,
  createMockSamlEnvSet,
} from './__mocks__/saml-application.js';
import { SamlApplication } from './index.js';
import { getSamlRedirectSignatureInput, assertSamlAuthnRequestSignatureScope } from './utils.js';

const keys = await generateKeyPairAndCertificate(1);
const wrongKeys = await generateKeyPairAndCertificate(1);
const createApplication = (required = true, certificate = keys.certificate) => {
  const details = {
    ...createMockSamlApplicationDetails(keys),
    authnRequestConfig: {
      forceAuthn: false,
      requireSignedAuthnRequests: required,
      signingCertificate: certificate,
    },
  };
  return new SamlApplication(details, 'saml-app-id', createMockSamlEnvSet());
};

// eslint-disable-next-line new-cap -- Samlify exposes capitalized entity factories.
const sp = saml.ServiceProvider({
  entityID: 'sp-entity-id',
  assertionConsumerService: [{ Binding: BindingType.Post, Location: 'https://sp.example.com/acs' }],
  privateKey: keys.privateKey,
  signingCert: keys.certificate,
  authnRequestsSigned: true,
});

const createRequest = (binding: 'post' | 'redirect', tampered = false) => {
  const { context } = sp.createLoginRequest(createApplication().idp, binding, { forceAuthn: true });
  if (binding === 'post') {
    return {
      body: {
        SAMLRequest: tampered
          ? Buffer.from(
              Buffer.from(context, 'base64')
                .toString()
                .replace('ForceAuthn="true"', 'ForceAuthn="false"')
            ).toString('base64')
          : context,
      },
    };
  }
  const url = new URL(context);
  if (tampered) {
    const request = url.searchParams.get('SAMLRequest') ?? '';
    url.searchParams.set(
      'SAMLRequest',
      deflateRawSync(
        inflateRawSync(Buffer.from(request, 'base64'))
          .toString()
          .replace('ForceAuthn="true"', 'ForceAuthn="false"')
      ).toString('base64')
    );
  }
  return {
    query: Object.fromEntries(url.searchParams),
    octetString: getSamlRedirectSignatureInput(url.search.slice(1)),
  };
};

const unsignedXml =
  '<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="request-id" Version="2.0" IssueInstant="2026-09-09T00:00:00Z"><saml:Issuer>sp-entity-id</saml:Issuer></samlp:AuthnRequest>';

describe('SAML request signatures', () => {
  it('advertises the signature requirement', () => {
    expect(createApplication().idPMetadata).toContain('WantAuthnRequestsSigned="true"');
  });

  describe.each(['post', 'redirect'] as const)('%s binding', (binding) => {
    it('accepts a request signed by the configured SP', async () => {
      await expect(
        createApplication().parseLoginRequest(binding, createRequest(binding))
      ).resolves.toBeDefined();
    });

    it('rejects a request signed by another certificate', async () => {
      await expect(
        createApplication(true, wrongKeys.certificate).parseLoginRequest(
          binding,
          createRequest(binding)
        )
      ).rejects.toThrow();
    });

    it('rejects a tampered request', async () => {
      await expect(
        createApplication().parseLoginRequest(binding, createRequest(binding, true))
      ).rejects.toThrow();
    });

    it.each([true, false])('handles unsigned requests with requirement %s', async (required) => {
      const request =
        binding === 'post'
          ? { body: { SAMLRequest: Buffer.from(unsignedXml).toString('base64') } }
          : { query: { SAMLRequest: deflateRawSync(unsignedXml).toString('base64') } };
      const result = createApplication(required).parseLoginRequest(binding, request);
      if (required) {
        await expect(result).rejects.toThrow();
        return;
      }
      await expect(result).resolves.toBeDefined();
    });
  });
});

describe('Redirect signature input', () => {
  it('preserves original encoding in canonical order and excludes other parameters', () => {
    expect(
      getSamlRedirectSignatureInput(
        'extra=value&SigAlg=rsa%2fsha&Signature=ignored&RelayState=a+b%20c&SAMLRequest=abc%2bdef'
      )
    ).toBe('SAMLRequest=abc%2bdef&RelayState=a+b%20c&SigAlg=rsa%2fsha');
  });

  it('omits absent RelayState but retains an explicitly empty one', () => {
    expect(getSamlRedirectSignatureInput('SigAlg=rsa&SAMLRequest=abc')).toBe(
      'SAMLRequest=abc&SigAlg=rsa'
    );
    expect(getSamlRedirectSignatureInput('RelayState=&SigAlg=rsa&SAMLRequest=abc')).toBe(
      'SAMLRequest=abc&RelayState=&SigAlg=rsa'
    );
  });
});

describe('SP signing certificate validation', () => {
  it('accepts a valid signing certificate', () => {
    expect(() => {
      validateSamlAuthnRequestConfig({ signingCertificate: keys.certificate });
    }).not.toThrow();
  });

  it.each(['invalid', '-----BEGIN CERTIFICATE-----\ninvalid\n-----END CERTIFICATE-----'])(
    'rejects malformed certificate %j',
    (signingCertificate) => {
      expect(() => {
        validateSamlAuthnRequestConfig({ signingCertificate });
      }).toThrow();
    }
  );
});

describe('POST signature scope', () => {
  it('requires a reference to the enclosing AuthnRequest', () => {
    const request = createRequest('post');
    const xml = Buffer.from(request.body?.SAMLRequest ?? '', 'base64').toString();
    expect(() => {
      assertSamlAuthnRequestSignatureScope(xml);
    }).not.toThrow();
    expect(() => {
      assertSamlAuthnRequestSignatureScope(xml.replace(/URI="#[^"]+"/, 'URI="#another-element"'));
    }).toThrow();
  });
});
