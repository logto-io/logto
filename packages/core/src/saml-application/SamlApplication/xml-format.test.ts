import { deflateRawSync } from 'node:zlib';

import RequestError from '#src/errors/RequestError/index.js';

import {
  createMockSamlApplicationDetails,
  createMockSamlEnvSet,
} from './__mocks__/saml-application.js';
import { SamlApplication } from './index.js';

const createRequestXml = (extensions = '') =>
  `<?xml version="1.0" encoding="UTF-8"?><samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="request-id" Version="2.0" IssueInstant="2026-11-02T00:00:00Z"><saml:Issuer>sp-entity-id</saml:Issuer>${extensions}</samlp:AuthnRequest>`;

const application = new SamlApplication(
  createMockSamlApplicationDetails(),
  'saml-app-id',
  createMockSamlEnvSet()
);

describe.each(['post', 'redirect'] as const)('SAML request XML format (%s binding)', (binding) => {
  const parse = async (xml: string) =>
    application.parseLoginRequest(
      binding,
      binding === 'post'
        ? { body: { SAMLRequest: Buffer.from(xml).toString('base64') } }
        : { query: { SAMLRequest: deflateRawSync(xml).toString('base64') } }
    );

  it.each([
    ['without extensions', ''],
    [
      'with escaped text',
      '<samlp:Extensions><x:Note xmlns:x="urn:x">a &amp; b</x:Note></samlp:Extensions>',
    ],
  ])('accepts well-formed XML %s', async (_, extensions) => {
    await expect(parse(createRequestXml(extensions))).resolves.toBeDefined();
  });

  it.each([
    [
      'an unescaped ampersand',
      '<samlp:Extensions><x:Note xmlns:x="urn:x">a & b</x:Note></samlp:Extensions>',
    ],
    [
      'a mismatched end tag',
      '<samlp:Extensions><x:Note xmlns:x="urn:x">a</x:Other></samlp:Extensions>',
    ],
  ])('rejects XML with %s', async (_, extensions) => {
    await expect(parse(createRequestXml(extensions))).rejects.toMatchError(
      new RequestError('application.saml.invalid_saml_request')
    );
  });
});
