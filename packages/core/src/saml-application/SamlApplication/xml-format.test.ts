import { deflateRawSync } from 'node:zlib';

import RequestError from '#src/errors/RequestError/index.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';

import {
  createMockSamlApplicationDetails,
  createMockSamlEnvSet,
} from './__mocks__/saml-application.js';
import { SamlApplication } from './index.js';

const createRequestXml = (extensions = '') =>
  `<?xml version="1.0" encoding="UTF-8"?><samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="request-id" Version="2.0" IssueInstant="2026-11-02T00:00:00Z"><saml:Issuer>sp-entity-id</saml:Issuer>${extensions}</samlp:AuthnRequest>`;

describe.each(['post', 'redirect'] as const)('SAML request XML format (%s binding)', (binding) => {
  const parse = async (xml: string, log: LogEntry) =>
    new SamlApplication(
      createMockSamlApplicationDetails(),
      'saml-app-id',
      createMockSamlEnvSet()
    ).parseLoginRequest(
      binding,
      binding === 'post'
        ? { body: { SAMLRequest: Buffer.from(xml).toString('base64') } }
        : { query: { SAMLRequest: deflateRawSync(xml).toString('base64') } },
      log
    );

  it.each([
    ['without extensions', ''],
    [
      'with escaped text',
      '<samlp:Extensions><x:Note xmlns:x="urn:x">a &amp; b</x:Note></samlp:Extensions>',
    ],
  ])('accepts well-formed XML %s', async (_, extensions) => {
    const log = new LogEntry('SamlApplication.AuthnRequest');

    await expect(parse(createRequestXml(extensions), log)).resolves.toBeDefined();
    expect(log.payload).not.toHaveProperty('samlRequestError');
  });

  it.each([
    {
      name: 'an unescaped ampersand',
      extensions: '<samlp:Extensions><x:Note xmlns:x="urn:x">a & b</x:Note></samlp:Extensions>',
      error: { code: 'InvalidChar', column: 310, message: "char '&' is not expected." },
    },
    {
      name: 'a mismatched end tag',
      extensions: '<samlp:Extensions><x:Note xmlns:x="urn:x">a</x:Other></samlp:Extensions>',
      error: {
        code: 'InvalidTag',
        column: 309,
        message:
          "Expected closing tag 'x:Note' (opened in line 1, col 284) instead of closing tag 'x:Other'.",
      },
    },
  ])('rejects XML with $name and logs the format error', async ({ extensions, error }) => {
    const log = new LogEntry('SamlApplication.AuthnRequest');

    await expect(parse(createRequestXml(extensions), log)).rejects.toMatchError(
      new RequestError('application.saml.invalid_saml_request')
    );
    expect(log.payload.samlRequestError).toEqual({ category: 'xml_format', line: 1, ...error });
  });

  const prefix = 'a'.repeat(250);

  it.each([
    {
      name: 'a control character',
      xml: createRequestXml('<samlp:Extensions><x\u0001y/></samlp:Extensions>'),
      message: "Tag 'xy' is an invalid name.",
    },
    {
      name: 'a character split by the length cap',
      xml: createRequestXml(`<samlp:Extensions><${prefix}😀b/></samlp:Extensions>`),
      message: `Tag '${prefix}�`,
    },
    {
      name: 'a lone surrogate in the parser message',
      xml: createRequestXml().replace('?>', '?>😀'),
      message: "char '�' is not expected.",
    },
  ])('sanitizes the logged message with $name', async ({ xml, message }) => {
    const log = new LogEntry('SamlApplication.AuthnRequest');

    await expect(parse(xml, log)).rejects.toThrow();
    expect(log.payload.samlRequestError).toMatchObject({ message });
  });
});
