import { ApplicationType, NameIdFormat, type SamlApplicationResponse } from '@logto/schemas';

import {
  getStaticAttributeKeyError,
  getStaticAttributeValueError,
  parseFormDataToSamlApplicationRequest,
  parseFormDataToStaticAttributes,
  parseSamlApplicationResponseToFormData,
  parseStaticAttributesToFormData,
} from './utils';

const buildResponse = (
  authnRequestConfig: SamlApplicationResponse['authnRequestConfig']
): SamlApplicationResponse =>
  ({
    id: 'saml-app',
    name: 'SAML app',
    description: null,
    type: ApplicationType.SAML,
    entityId: 'https://sp.example.com',
    acsUrl: null,
    nameIdFormat: NameIdFormat.Persistent,
    encryption: null,
    attributeMapping: {},
    authnRequestConfig,
  }) as unknown as SamlApplicationResponse;

describe('SAML application authentication policy form mapping', () => {
  it.each([
    { authnRequestConfig: null, expected: true },
    { authnRequestConfig: {}, expected: true },
    { authnRequestConfig: { forceAuthn: true }, expected: true },
    { authnRequestConfig: { forceAuthn: false }, expected: false },
  ])('shows forced authentication for %j', ({ authnRequestConfig, expected }) => {
    expect(
      parseSamlApplicationResponseToFormData(buildResponse(authnRequestConfig)).forceAuthn
    ).toBe(expected);
  });

  it('keeps the request signature settings when saving the toggle', () => {
    const authnRequestConfig = {
      requireSignedAuthnRequests: true,
      signingCertificate: 'certificate',
    };
    const formData = {
      ...parseSamlApplicationResponseToFormData(buildResponse(authnRequestConfig)),
      forceAuthn: false,
    };

    expect(
      parseFormDataToSamlApplicationRequest(formData, authnRequestConfig).payload.authnRequestConfig
    ).toEqual({ ...authnRequestConfig, forceAuthn: false });
  });
});

describe('SAML application static attributes form mapping', () => {
  it('shows a single empty row when there are no static attributes', () => {
    expect(parseStaticAttributesToFormData({})).toEqual([{ key: '', value: '' }]);
  });

  it('round-trips static attributes', () => {
    const staticAttributes = { site: '2', account: 'acct-1' };

    expect(
      parseFormDataToStaticAttributes(parseStaticAttributesToFormData(staticAttributes))
    ).toEqual(staticAttributes);
  });

  it('drops empty rows', () => {
    expect(
      parseFormDataToStaticAttributes([
        { key: '', value: '' },
        { key: 'site', value: '2' },
      ])
    ).toEqual({ site: '2' });
    expect(parseFormDataToStaticAttributes([{ key: '', value: '' }])).toEqual({});
  });

  it('keeps half-filled rows for the server to reject', () => {
    expect(parseFormDataToStaticAttributes([{ key: 'site', value: '' }])).toEqual({ site: '' });
  });

  it.each([
    { rows: [{ key: '', value: '' }], expected: undefined },
    { rows: [{ key: '', value: '2' }], expected: 'key_missing_error' },
    {
      rows: [
        { key: 'site', value: '2' },
        { key: 'site', value: '3' },
      ],
      expected: 'key_duplicated_error',
    },
    {
      rows: [
        { key: '', value: '' },
        { key: '', value: '' },
      ],
      expected: undefined,
    },
    { rows: [{ key: ' site', value: '2' }], expected: 'invalid_key_error' },
    { rows: [{ key: 'my site', value: '2' }], expected: 'invalid_key_error' },
    { rows: [{ key: '<x>', value: '2' }], expected: 'invalid_key_error' },
    { rows: [{ key: 'urn:oid:2.5.4.42', value: '2' }], expected: undefined },
    { rows: [{ key: 'http://schemas.xmlsoap.org/claims/Group', value: '2' }], expected: undefined },
  ])('validates the first static attribute name in %j', ({ rows, expected }) => {
    expect(getStaticAttributeKeyError(rows, 0)).toBe(expected);
  });

  it('requires a value once a name is set', () => {
    expect(getStaticAttributeValueError([{ key: 'site', value: '' }], 0)).toBe(
      'value_missing_error'
    );
    expect(getStaticAttributeValueError([{ key: '', value: '' }], 0)).toBeUndefined();
    expect(getStaticAttributeValueError([{ key: 'site', value: '2' }], 0)).toBeUndefined();
  });
});
