import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  ConnectorConfigFormItemType,
  confidentialValueMask,
  connectorConfigFormItemGuard,
  getValue,
  maskConfidentialConnectorConfig,
  type AllConnector,
  type ConnectorConfigFormItem,
  type CreateConnector,
} from '@logto/connector-kit';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const connectorsDirectory = path.resolve(currentDirectory, '../../../../connectors');

const connectorDirectories = readdirSync(connectorsDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('connector-'))
  .map((entry) => entry.name)
  .slice()
  .sort();

/**
 * Built-in connectors that genuinely have no secret/credential fields in their `formItems`.
 * Any new built-in connector not listed here must declare at least one `isConfidential` field.
 */
const connectorsWithoutSecrets = new Set([
  'connector-apple',
  'connector-logto-social-demo',
  'connector-mock-email',
  'connector-mock-email-alternative',
  'connector-mock-sms',
  'connector-mock-social',
  'connector-siwe',
]);

const exactSecretKeys = new Set(['authorization', 'token', 'pass', 'pwd', 'pfx']);
const secretKeyFragments = [
  'secret',
  'password',
  'apikey',
  'privatekey',
  'signingkey',
  'passphrase',
  'credential',
];

/** Non-sensitive config keys whose names happen to contain a secret-like substring. */
const nonSecretKeyAllowlist = new Set([
  'clientsecretjwtsigningalgorithm',
  'forgotpassword', // TemplateType.ForgotPassword key in email delivery templates (e.g. Mailgun).
]);

/** Identifiers and public metadata keys that must never be marked confidential. */
const nonConfidentialIdentifierKeys = new Set([
  'clientId',
  'appId',
  'accessKeyId',
  'accountSID',
  'corpId',
  'agentId',
  'phoneNumberId',
  'entityID',
  'endpoint',
  'tokenEndpoint',
  'authorizationEndpoint',
  'userInfoEndpoint',
  'signInEndpoint',
  'issuer',
  'host',
  'domain',
  'fromEmail',
  'x509Certificate',
  'idpMetadataXml',
]);

const normalizeKey = (key: string) => key.replaceAll(/[_-]/g, '').toLowerCase();

const looksLikeSecretKey = (key: string): boolean => {
  const normalized = normalizeKey(key);

  if (nonSecretKeyAllowlist.has(normalized)) {
    return false;
  }

  return (
    exactSecretKeys.has(normalized) ||
    normalized.endsWith('token') ||
    secretKeyFragments.some((fragment) => normalized.includes(fragment))
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const buildJsonSampleValue = (
  item: Extract<ConnectorConfigFormItem, { type: ConnectorConfigFormItemType.Json }>
): unknown => {
  if (!Array.isArray(item.isConfidential)) {
    return item.defaultValue ?? {};
  }

  const base = isRecord(item.defaultValue) ? item.defaultValue : {};

  return {
    ...base,
    ...Object.fromEntries(item.isConfidential.map((subKey) => [subKey, `sample-${subKey}-secret`])),
    nonSensitiveMeta: 'keep-intact',
  };
};

const buildSampleValue = (item: ConnectorConfigFormItem): unknown => {
  switch (item.type) {
    case ConnectorConfigFormItemType.Text:
    case ConnectorConfigFormItemType.MultilineText: {
      return `sample-${item.key}-value`;
    }
    case ConnectorConfigFormItemType.Number: {
      return 587;
    }
    case ConnectorConfigFormItemType.Switch: {
      return false;
    }
    case ConnectorConfigFormItemType.Select: {
      return item.selectItems[0]?.value ?? 'sample';
    }
    case ConnectorConfigFormItemType.MultiSelect: {
      return item.selectItems.slice(0, 1).map(({ value }) => value);
    }
    case ConnectorConfigFormItemType.Json: {
      return buildJsonSampleValue(item);
    }
  }
};

const buildSampleConfig = (
  formItems: readonly ConnectorConfigFormItem[]
): Record<string, unknown> =>
  Object.fromEntries(formItems.map((item) => [item.key, buildSampleValue(item)]));

const getConfidentiality = (item: ConnectorConfigFormItem) =>
  'isConfidential' in item ? item.isConfidential : undefined;

const assertFormItemAnnotations = (item: ConnectorConfigFormItem) => {
  const confidentiality = getConfidentiality(item);

  if (nonConfidentialIdentifierKeys.has(item.key)) {
    expect(confidentiality).toBeFalsy();
  }

  if (!confidentiality) {
    expect(looksLikeSecretKey(item.key)).toBe(false);
  }

  if (
    item.type === ConnectorConfigFormItemType.Json &&
    confidentiality !== true &&
    isRecord(item.defaultValue)
  ) {
    const declaredSubKeys = new Set(Array.isArray(confidentiality) ? confidentiality : []);

    for (const subKey of Object.keys(item.defaultValue)) {
      if (!declaredSubKeys.has(subKey)) {
        expect(looksLikeSecretKey(subKey)).toBe(false);
      }
    }
  }
};

const assertMaskedConfig = (
  formItems: readonly ConnectorConfigFormItem[],
  sampleConfig: Record<string, unknown>,
  maskedConfig: Record<string, unknown>
) => {
  for (const item of formItems) {
    const confidentiality = getConfidentiality(item);

    if (!confidentiality) {
      expect(maskedConfig[item.key]).toEqual(sampleConfig[item.key]);
      continue;
    }

    if (confidentiality === true) {
      expect(maskedConfig[item.key]).toBe(confidentialValueMask);
      continue;
    }

    for (const subKey of confidentiality) {
      expect(getValue(maskedConfig, `${item.key}.${subKey}`)).toBe(confidentialValueMask);
    }

    expect(getValue(maskedConfig, `${item.key}.nonSensitiveMeta`)).toBe('keep-intact');
  }
};

const loadConnectorMetadata = async (packageDirectory: string) => {
  const entryUrl = pathToFileURL(
    path.join(connectorsDirectory, packageDirectory, 'lib', 'index.js')
  ).href;
  const imported: unknown = await import(entryUrl);
  const createConnector = (imported as { default: CreateConnector<AllConnector> }).default;
  const connector = await createConnector({ getConfig: async () => ({}) });

  return connector.metadata;
};

describe('built-in connector confidential metadata', () => {
  it('keeps connectorsWithoutSecrets in sync with existing connector packages', () => {
    const existing = new Set(connectorDirectories);

    for (const packageDirectory of connectorsWithoutSecrets) {
      expect(existing.has(packageDirectory)).toBe(true);
    }
  });

  it.each(connectorDirectories)(
    'validates confidential annotations and masks secrets for %s',
    async (packageDirectory) => {
      const metadata = await loadConnectorMetadata(packageDirectory);
      const formItems = metadata.formItems ?? [];

      for (const item of formItems) {
        expect(() => connectorConfigFormItemGuard.parse(item)).not.toThrow();
      }

      const confidentialItems = formItems.filter(
        (item) => 'isConfidential' in item && Boolean(item.isConfidential)
      );

      if (connectorsWithoutSecrets.has(packageDirectory)) {
        expect(confidentialItems).toEqual([]);
      } else {
        expect(confidentialItems.length).toBeGreaterThan(0);
      }

      // Guard against unannotated secret-looking fields and accidentally masked identifiers.
      for (const item of formItems) {
        assertFormItemAnnotations(item);
      }

      const sampleConfig = buildSampleConfig(formItems);
      const maskedConfig = maskConfidentialConnectorConfig(sampleConfig, formItems);
      assertMaskedConfig(formItems, sampleConfig, maskedConfig);
    }
  );

  it('masks nested Json credentials for connector-smtp while preserving non-sensitive fields', async () => {
    const metadata = await loadConnectorMetadata('connector-smtp');
    const sampleConfig = {
      host: 'smtp.example.com',
      port: 587,
      fromEmail: 'no-reply@example.com',
      auth: {
        type: 'oauth2',
        user: 'smtp-user@example.com',
        pass: 'sample-smtp-pass',
        clientId: 'smtp-oauth-client-id',
        clientSecret: 'sample-smtp-client-secret',
        refreshToken: 'sample-smtp-refresh-token',
        accessToken: 'sample-smtp-access-token',
        privateKey: {
          key: '-----BEGIN PRIVATE KEY-----\nsample',
          passphrase: 'sample-key-passphrase',
        },
        serviceClient: 'service-client-id',
      },
      tls: {
        servername: 'smtp.example.com',
        rejectUnauthorized: true,
        key: '-----BEGIN PRIVATE KEY-----\ntls-key',
        passphrase: 'sample-tls-passphrase',
        pfx: 'sample-pfx-secret',
      },
    };

    const masked = maskConfidentialConnectorConfig(sampleConfig, metadata.formItems);

    expect(masked).toEqual({
      host: 'smtp.example.com',
      port: 587,
      fromEmail: 'no-reply@example.com',
      auth: {
        type: 'oauth2',
        user: 'smtp-user@example.com',
        pass: confidentialValueMask,
        clientId: 'smtp-oauth-client-id',
        clientSecret: confidentialValueMask,
        refreshToken: confidentialValueMask,
        accessToken: confidentialValueMask,
        privateKey: {
          key: confidentialValueMask,
          passphrase: confidentialValueMask,
        },
        serviceClient: 'service-client-id',
      },
      tls: {
        servername: 'smtp.example.com',
        rejectUnauthorized: true,
        key: confidentialValueMask,
        passphrase: confidentialValueMask,
        pfx: confidentialValueMask,
      },
    });
  });
});
