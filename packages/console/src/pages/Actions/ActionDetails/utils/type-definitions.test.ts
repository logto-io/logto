import {
  ActionTypeDefinitionKey,
  buildEnvironmentVariablesTypeDefinition,
} from './type-definitions';

describe('buildEnvironmentVariablesTypeDefinition', () => {
  it('returns undefined when environment variables are missing', () => {
    expect(buildEnvironmentVariablesTypeDefinition()).toBe(
      `declare type ${ActionTypeDefinitionKey.EnvironmentVariables} = undefined`
    );
  });

  it('types only env vars that have a valid key and a non-empty value', () => {
    expect(
      buildEnvironmentVariablesTypeDefinition([
        { key: '', value: '' },
        { key: 'LEGACY_PASSWORD', value: 'pa$sw0ld' },
        { key: 'MISSING_VALUE', value: '' },
        { key: 'BAD-KEY', value: 'secret' },
        { key: 'LEGACY_IDENTIFIER', value: 'testuser' },
      ])
    ).toBe(`declare type ${ActionTypeDefinitionKey.EnvironmentVariables} = {
  "LEGACY_PASSWORD": string;
"LEGACY_IDENTIFIER": string
    }`);
  });

  it('trims keys before validating and typing them', () => {
    expect(
      buildEnvironmentVariablesTypeDefinition([{ key: ' LEGACY_PASSWORD ', value: 'pa$sw0ld' }])
    ).toBe(`declare type ${ActionTypeDefinitionKey.EnvironmentVariables} = {
  "LEGACY_PASSWORD": string
    }`);
  });
});
