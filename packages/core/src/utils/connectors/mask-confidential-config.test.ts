import {
  ConnectorConfigFormItemType,
  connectorConfigFormItemGuard,
  type ConnectorConfigFormItem,
} from '@logto/connector-kit';

import {
  confidentialValueMask,
  maskConfidentialConnectorConfig,
} from './mask-confidential-config.js';

describe('connectorConfigFormItemGuard isConfidential', () => {
  it('accepts boolean isConfidential on Text, MultilineText, and Json items', () => {
    expect(
      connectorConfigFormItemGuard.parse({
        key: 'clientSecret',
        label: 'Client Secret',
        type: ConnectorConfigFormItemType.Text,
        isConfidential: true,
      })
    ).toMatchObject({ key: 'clientSecret', isConfidential: true });

    expect(
      connectorConfigFormItemGuard.parse({
        key: 'privateKey',
        label: 'Private Key',
        type: ConnectorConfigFormItemType.MultilineText,
        isConfidential: true,
      })
    ).toMatchObject({ key: 'privateKey', isConfidential: true });

    expect(
      connectorConfigFormItemGuard.parse({
        key: 'auth',
        label: 'Auth',
        type: ConnectorConfigFormItemType.Json,
        isConfidential: true,
      })
    ).toMatchObject({ key: 'auth', isConfidential: true });
  });
});

describe('maskConfidentialConnectorConfig', () => {
  it('masks Text and MultilineText fields while preserving non-confidential fields', () => {
    const formItems: ConnectorConfigFormItem[] = [
      { key: 'clientId', label: 'Client ID', type: ConnectorConfigFormItemType.Text },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: ConnectorConfigFormItemType.Text,
        isConfidential: true,
      },
      {
        key: 'privateKey',
        label: 'Private Key',
        type: ConnectorConfigFormItemType.MultilineText,
        isConfidential: true,
      },
      {
        key: 'optionalSecret',
        label: 'Optional Secret',
        type: ConnectorConfigFormItemType.Text,
        isConfidential: true,
      },
    ];

    const input = {
      clientId: 'client-id-123',
      clientSecret: 'super-secret',
      privateKey: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----',
    };

    const masked = maskConfidentialConnectorConfig(input, formItems);

    expect(masked).toEqual({
      clientId: 'client-id-123',
      clientSecret: confidentialValueMask,
      privateKey: confidentialValueMask,
    });
    expect('optionalSecret' in masked).toBe(false);
    // Input is not mutated.
    expect(input.clientSecret).toBe('super-secret');
  });

  it('masks all leaf strings when a Json item has isConfidential: true', () => {
    const formItems: ConnectorConfigFormItem[] = [
      { key: 'host', label: 'Host', type: ConnectorConfigFormItemType.Text },
      {
        key: 'secrets',
        label: 'Secrets',
        type: ConnectorConfigFormItemType.Json,
        isConfidential: true,
      },
    ];

    const input = {
      host: 'smtp.example.com',
      secrets: {
        a: 'secret-a',
        nested: { b: 'secret-b', count: 2, enabled: true },
        list: ['secret-c', 42],
      },
    };

    const masked = maskConfidentialConnectorConfig(input, formItems);

    expect(masked).toEqual({
      host: 'smtp.example.com',
      secrets: {
        a: confidentialValueMask,
        nested: { b: confidentialValueMask, count: 2, enabled: true },
        list: [confidentialValueMask, 42],
      },
    });
    // Input is not mutated.
    expect(input.secrets.a).toBe('secret-a');
    expect(input.secrets.nested.b).toBe('secret-b');
  });

  it('returns a shallow copy when formItems is undefined or empty', () => {
    const input = { clientId: 'abc', clientSecret: 'xyz' };
    const result = maskConfidentialConnectorConfig(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });
});
