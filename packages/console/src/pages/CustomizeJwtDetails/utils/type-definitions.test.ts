import { JwtCustomizerTypeDefinitionKey } from '@/consts/jwt-customizer-type-definition';

import {
  buildAccessTokenJwtCustomizerContextTsDefinition,
  buildClientCredentialsJwtCustomizerContextTsDefinition,
  buildEnvironmentVariablesTypeDefinition,
} from './type-definitions';

const mockIsCloud = jest.fn(() => false);
const mockIsDevFeaturesEnabled = jest.fn(() => true);

jest.mock('@/consts/env', () => ({
  get isCloud() {
    return mockIsCloud();
  },
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled();
  },
}));

describe('buildEnvironmentVariablesTypeDefinition', () => {
  it('returns undefined when environment variables are missing', () => {
    expect(buildEnvironmentVariablesTypeDefinition()).toBe(
      `declare type ${JwtCustomizerTypeDefinitionKey.EnvironmentVariables} = undefined`
    );
  });

  it('types only env vars that have a valid key and a non-empty value', () => {
    expect(
      buildEnvironmentVariablesTypeDefinition([
        { key: '', value: '' },
        { key: 'API_KEY', value: 'secret' },
        { key: 'MISSING_VALUE', value: '' },
        { key: 'BAD-KEY', value: 'secret' },
        { key: 'ENDPOINT', value: 'https://example.com' },
      ])
    ).toBe(`declare type ${JwtCustomizerTypeDefinitionKey.EnvironmentVariables} = {
  "API_KEY": string;
"ENDPOINT": string
    }`);
  });

  it('trims keys before validating and typing them', () => {
    expect(buildEnvironmentVariablesTypeDefinition([{ key: ' API_KEY ', value: 'secret' }]))
      .toBe(`declare type ${JwtCustomizerTypeDefinitionKey.EnvironmentVariables} = {
  "API_KEY": string
    }`);
  });
});

// Custom JWT cryptographic capability
describe('Custom JWT cryptographic capability authoring types', () => {
  beforeEach(() => {
    mockIsCloud.mockReturnValue(false);
    mockIsDevFeaturesEnabled.mockReturnValue(true);
  });

  it.each([
    ['access tokens', buildAccessTokenJwtCustomizerContextTsDefinition],
    ['client credentials', buildClientCredentialsJwtCustomizerContextTsDefinition],
  ] as const)(
    'includes required crypto methods for %s when the capability is enabled',
    (_, build) => {
      const definition = build();

      expect(definition).toContain('crypto: {');
      expect(definition).toContain('sha256: (input: string) => Promise<string>;');
      expect(definition).toContain(
        'hmacSha256: (options: { key: string; input: string }) => Promise<string>;'
      );
    }
  );

  it('omits crypto from authoring types when development features are disabled', () => {
    mockIsDevFeaturesEnabled.mockReturnValue(false);

    expect(buildAccessTokenJwtCustomizerContextTsDefinition()).not.toContain('crypto:');
  });

  it('omits crypto from authoring types in Cloud mode', () => {
    mockIsCloud.mockReturnValue(true);

    expect(buildAccessTokenJwtCustomizerContextTsDefinition()).not.toContain('crypto:');
  });
});
