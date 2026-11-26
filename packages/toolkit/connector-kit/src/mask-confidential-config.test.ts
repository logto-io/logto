import { describe, expect, it } from 'vitest';

import {
  confidentialValueMask,
  maskConfidentialConnectorConfig,
} from './mask-confidential-config.js';
import {
  ConnectorConfigFormItemType,
  connectorConfigFormItemGuard,
  type ConnectorConfigFormItem,
} from './types/config-form.js';

describe('connectorConfigFormItemGuard isConfidential', () => {
  it('accepts boolean isConfidential on Text and MultilineText items', () => {
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
  });

  it('accepts boolean or string[] isConfidential on Json items', () => {
    expect(
      connectorConfigFormItemGuard.parse({
        key: 'secretBlob',
        label: 'Secret Blob',
        type: ConnectorConfigFormItemType.Json,
        isConfidential: true,
      })
    ).toMatchObject({ key: 'secretBlob', isConfidential: true });

    expect(
      connectorConfigFormItemGuard.parse({
        key: 'auth',
        label: 'Auth',
        type: ConnectorConfigFormItemType.Json,
        isConfidential: ['pass', 'clientSecret', 'privateKey'],
      })
    ).toMatchObject({
      key: 'auth',
      isConfidential: ['pass', 'clientSecret', 'privateKey'],
    });
  });

  it('rejects empty key paths in Json isConfidential array', () => {
    expect(() =>
      connectorConfigFormItemGuard.parse({
        key: 'auth',
        label: 'Auth',
        type: ConnectorConfigFormItemType.Json,
        isConfidential: [''],
      })
    ).toThrow();
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

  it('masks declared sub-keys on Json items including nested objects and dot paths', () => {
    const formItems: ConnectorConfigFormItem[] = [
      { key: 'host', label: 'Host', type: ConnectorConfigFormItemType.Text },
      {
        key: 'auth',
        label: 'Auth',
        type: ConnectorConfigFormItemType.Json,
        isConfidential: ['pass', 'clientSecret', 'refreshToken', 'accessToken', 'privateKey'],
      },
      {
        key: 'nested',
        label: 'Nested',
        type: ConnectorConfigFormItemType.Json,
        isConfidential: ['credentials.token'],
      },
    ];

    const input = {
      host: 'smtp.example.com',
      auth: {
        type: 'oauth2',
        user: 'alice@example.com',
        pass: 'smtp-pass',
        clientId: 'oauth-client-id',
        clientSecret: 'oauth-client-secret',
        refreshToken: 'refresh-tok',
        accessToken: 'access-tok',
        expires: 3600,
        privateKey: {
          key: '-----BEGIN PRIVATE KEY-----\nxyz',
          passphrase: 'key-passphrase',
        },
      },
      nested: {
        credentials: {
          token: 'nested-secret',
          publicId: 'pub-1',
        },
      },
    };

    const masked = maskConfidentialConnectorConfig(input, formItems);

    expect(masked).toEqual({
      host: 'smtp.example.com',
      auth: {
        type: 'oauth2',
        user: 'alice@example.com',
        pass: confidentialValueMask,
        clientId: 'oauth-client-id',
        clientSecret: confidentialValueMask,
        refreshToken: confidentialValueMask,
        accessToken: confidentialValueMask,
        expires: 3600,
        privateKey: {
          key: confidentialValueMask,
          passphrase: confidentialValueMask,
        },
      },
      nested: {
        credentials: {
          token: confidentialValueMask,
          publicId: 'pub-1',
        },
      },
    });
    // Input is not mutated.
    expect(input.auth.pass).toBe('smtp-pass');
    expect(input.auth.privateKey.key).toBe('-----BEGIN PRIVATE KEY-----\nxyz');
  });

  it('masks all leaf strings when a Json item has isConfidential: true', () => {
    const formItems: ConnectorConfigFormItem[] = [
      {
        key: 'secrets',
        label: 'Secrets',
        type: ConnectorConfigFormItemType.Json,
        isConfidential: true,
      },
    ];

    const masked = maskConfidentialConnectorConfig(
      {
        secrets: {
          a: 'secret-a',
          nested: { b: 'secret-b', count: 2, enabled: true },
          list: ['secret-c', 42],
        },
      },
      formItems
    );

    expect(masked).toEqual({
      secrets: {
        a: confidentialValueMask,
        nested: { b: confidentialValueMask, count: 2, enabled: true },
        list: [confidentialValueMask, 42],
      },
    });
  });

  it('returns a shallow copy when formItems is undefined or empty', () => {
    const input = { clientId: 'abc', clientSecret: 'xyz' };
    const result = maskConfidentialConnectorConfig(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });
});
