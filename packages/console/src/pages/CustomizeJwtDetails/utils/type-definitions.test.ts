import { JwtCustomizerTypeDefinitionKey } from '@/consts/jwt-customizer-type-definition';

import { buildEnvironmentVariablesTypeDefinition } from './type-definitions';

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
