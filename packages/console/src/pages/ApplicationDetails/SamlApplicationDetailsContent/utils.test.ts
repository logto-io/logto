import { ApplicationType, NameIdFormat, type SamlApplicationResponse } from '@logto/schemas';

import {
  parseFormDataToSamlApplicationRequest,
  parseSamlApplicationResponseToFormData,
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
