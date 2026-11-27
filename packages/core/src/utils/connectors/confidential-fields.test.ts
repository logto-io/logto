import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  ConnectorConfigFormItemType,
  connectorConfigFormItemGuard,
  type AllConnector,
  type ConnectorConfigFormItem,
  type CreateConnector,
} from '@logto/connector-kit';
import {
  ZodDefault,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodIntersection,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodUnion,
  type ZodTypeAny,
} from 'zod';

import {
  confidentialValueMask,
  maskConfidentialConnectorConfig,
} from './mask-confidential-config.js';

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

/**
 * Top-level `configGuard` keys that are intentionally omitted from `formItems` and hold no secrets.
 * Any other `configGuard` key must be declared in `formItems` so credential masking cannot miss it.
 */
const guardOnlyNonSecretKeys = new Set([
  'oneTap',
  'responseType',
  'grantType',
  'redirectUri',
  'authnRequestBinding',
  'assertionBinding',
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

const extractTopLevelGuardKeys = (guard: ZodTypeAny): string[] => {
  if (guard instanceof ZodObject) {
    return Object.keys(guard.shape as Record<string, unknown>);
  }

  if (guard instanceof ZodEffects) {
    return extractTopLevelGuardKeys(guard._def.schema as ZodTypeAny);
  }

  if (guard instanceof ZodOptional || guard instanceof ZodNullable || guard instanceof ZodDefault) {
    return extractTopLevelGuardKeys(guard._def.innerType as ZodTypeAny);
  }

  if (guard instanceof ZodUnion) {
    return [
      ...new Set(
        (guard._def.options as ZodTypeAny[]).flatMap((option) => extractTopLevelGuardKeys(option))
      ),
    ];
  }

  if (guard instanceof ZodDiscriminatedUnion) {
    return [
      ...new Set(
        (guard._def.options as ZodTypeAny[]).flatMap((option) => extractTopLevelGuardKeys(option))
      ),
    ];
  }

  if (guard instanceof ZodIntersection) {
    return [
      ...new Set([
        ...extractTopLevelGuardKeys(guard._def.left as ZodTypeAny),
        ...extractTopLevelGuardKeys(guard._def.right as ZodTypeAny),
      ]),
    ];
  }

  return [];
};

const buildJsonSampleValue = (item: ConnectorConfigFormItem): unknown => {
  if (!item.isConfidential) {
    return item.defaultValue ?? {};
  }

  const base = isRecord(item.defaultValue) ? item.defaultValue : {};

  return {
    ...base,
    sampleSecret: 'sample-secret-value',
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

const assertAllLeafStringsMasked = (value: unknown) => {
  if (typeof value === 'string') {
    expect(value).toBe(confidentialValueMask);
    return;
  }

  if (Array.isArray(value)) {
    for (const element of value) {
      assertAllLeafStringsMasked(element);
    }
    return;
  }

  if (isRecord(value)) {
    for (const element of Object.values(value)) {
      assertAllLeafStringsMasked(element);
    }
  }
};

const assertFormItemAnnotations = (item: ConnectorConfigFormItem) => {
  if (nonConfidentialIdentifierKeys.has(item.key)) {
    expect(item.isConfidential).toBeFalsy();
  }

  if (!item.isConfidential) {
    expect(looksLikeSecretKey(item.key)).toBe(false);
  }

  if (
    item.type === ConnectorConfigFormItemType.Json &&
    !item.isConfidential &&
    isRecord(item.defaultValue)
  ) {
    for (const subKey of Object.keys(item.defaultValue)) {
      expect(looksLikeSecretKey(subKey)).toBe(false);
    }
  }
};

const assertMaskedConfig = (
  formItems: readonly ConnectorConfigFormItem[],
  sampleConfig: Record<string, unknown>,
  maskedConfig: Record<string, unknown>
) => {
  for (const item of formItems) {
    if (!item.isConfidential) {
      expect(maskedConfig[item.key]).toEqual(sampleConfig[item.key]);
      continue;
    }

    if (item.type === ConnectorConfigFormItemType.Json) {
      assertAllLeafStringsMasked(maskedConfig[item.key]);
      continue;
    }

    expect(maskedConfig[item.key]).toBe(confidentialValueMask);
  }
};

const loadConnector = async (packageDirectory: string) => {
  const entryUrl = pathToFileURL(
    path.join(connectorsDirectory, packageDirectory, 'lib', 'index.js')
  ).href;
  const imported: unknown = await import(entryUrl);
  const createConnector = (imported as { default: CreateConnector<AllConnector> }).default;

  return createConnector({ getConfig: async () => ({}) });
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
      const connector = await loadConnector(packageDirectory);
      const { metadata, configGuard } = connector;
      const formItems = metadata.formItems ?? [];

      for (const item of formItems) {
        expect(() => connectorConfigFormItemGuard.parse(item)).not.toThrow();
      }

      // Every top-level `configGuard` key on non-mock connectors must either appear in `formItems`
      // or be explicitly allowlisted as a non-secret guard-only key, preventing unmasked config
      // fields like `dkim`. Mock connectors intentionally omit `formItems` and use `configTemplate`.
      if (!packageDirectory.startsWith('connector-mock-')) {
        const formItemKeys = new Set(formItems.map((item) => item.key));
        const guardKeys = extractTopLevelGuardKeys(configGuard);
        const undeclaredGuardKeys = guardKeys.filter(
          (key) => !formItemKeys.has(key) && !guardOnlyNonSecretKeys.has(key)
        );
        expect(undeclaredGuardKeys).toEqual([]);
      }

      const confidentialItems = formItems.filter((item) => Boolean(item.isConfidential));

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

  it('masks auth, tls, and dkim credentials for connector-smtp while preserving non-sensitive fields', async () => {
    const { metadata } = await loadConnector('connector-smtp');
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
      dkim: {
        domainName: 'example.com',
        keySelector: '2026',
        privateKey: '-----BEGIN PRIVATE KEY-----\ndkim-key',
      },
    };

    const masked = maskConfidentialConnectorConfig(sampleConfig, metadata.formItems);

    expect(masked).toEqual({
      host: 'smtp.example.com',
      port: 587,
      fromEmail: 'no-reply@example.com',
      auth: {
        type: confidentialValueMask,
        user: confidentialValueMask,
        pass: confidentialValueMask,
        clientId: confidentialValueMask,
        clientSecret: confidentialValueMask,
        refreshToken: confidentialValueMask,
        accessToken: confidentialValueMask,
        privateKey: {
          key: confidentialValueMask,
          passphrase: confidentialValueMask,
        },
        serviceClient: confidentialValueMask,
      },
      tls: {
        servername: confidentialValueMask,
        rejectUnauthorized: true,
        key: confidentialValueMask,
        passphrase: confidentialValueMask,
        pfx: confidentialValueMask,
      },
      dkim: {
        domainName: confidentialValueMask,
        keySelector: confidentialValueMask,
        privateKey: confidentialValueMask,
      },
    });
  });
});
