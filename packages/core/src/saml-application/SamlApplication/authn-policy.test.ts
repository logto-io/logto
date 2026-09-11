import {
  createMockSamlApplicationDetails,
  createMockSamlEnvSet,
} from './__mocks__/saml-application.js';
import { SamlApplication } from './index.js';

const oidcConfig = {
  issuer: 'https://issuer.example.com',
  authorizationEndpoint: 'https://issuer.example.com/auth',
  tokenEndpoint: 'https://issuer.example.com/token',
  jwksUri: 'https://issuer.example.com/jwks',
};

class TestSamlApplication extends SamlApplication {
  protected override fetchOidcConfig = async () => oidcConfig;
}

describe('SAML authentication policy', () => {
  it.each([
    { configured: false, requested: false, expected: false },
    { configured: true, requested: false, expected: true },
    { configured: false, requested: true, expected: true },
    { configured: true, requested: true, expected: true },
  ])('applies the IdP and SP requirements: %j', async ({ configured, requested, expected }) => {
    const details = {
      ...createMockSamlApplicationDetails(),
      authnRequestConfig: { forceAuthn: configured },
    };
    const application = new TestSamlApplication(details, 'saml-app-id', createMockSamlEnvSet());
    const url = await application.getSignInUrl({ forceAuthn: requested });
    expect(url.searchParams.get('prompt')).toBe(expected ? 'login' : null);
    expect(url.searchParams.get('max_age')).toBe(expected ? '0' : null);
  });
});
