import fs from 'node:fs/promises';

import { type OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';

import {
  devFeatureSchemaExtension,
  removeDevFeatureParameters,
  removeDevFeatureSchemaProperties,
  removeUnnecessaryOperations,
} from './general.js';

const originalIsCloud = EnvSet.values.isCloud;
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Tests need to cover both dev-feature states.
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = isDevFeaturesEnabled;
};

const createDevFeatureBooleanSchema = () =>
  ({
    type: 'boolean',
    [devFeatureSchemaExtension]: true,
  }) satisfies OpenAPIV3.SchemaObject & Record<typeof devFeatureSchemaExtension, true>;

const createDevFeatureStringSchema = () =>
  ({
    type: 'string',
    [devFeatureSchemaExtension]: true,
  }) satisfies OpenAPIV3.SchemaObject & Record<typeof devFeatureSchemaExtension, true>;

const createDocument = (): DeepPartial<OpenAPIV3.Document> => ({
  openapi: '3.0.1',
  info: {
    title: 'Test',
    version: '1.0.0',
  },
  paths: {
    '/api/mock': {
      patch: {
        parameters: [
          {
            name: 'stable',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'betaParameter',
            in: 'query',
            schema: createDevFeatureStringSchema(),
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'beta'],
                properties: {
                  name: {
                    type: 'string',
                  },
                  beta: createDevFeatureBooleanSchema(),
                },
              },
            },
          },
        },
      },
    },
  },
});

const createDevFeatureOperationDocument = (): DeepPartial<OpenAPIV3.Document> => ({
  openapi: '3.0.1',
  info: {
    title: 'Test',
    version: '1.0.0',
  },
  paths: {
    '/api/stable': {
      get: {
        tags: ['Stable'],
      },
    },
    '/api/dev': {
      get: {
        tags: ['Dev feature'],
      },
    },
  },
});

describe('swagger general utils', () => {
  afterEach(() => {
    Reflect.set(EnvSet.values, 'isCloud', originalIsCloud);
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('should remove dev feature schema properties and parameters when dev features are disabled', () => {
    setDevFeaturesEnabled(false);

    const document = createDocument();
    removeDevFeatureParameters(document);
    removeDevFeatureSchemaProperties(document);

    expect(document).toMatchObject({
      paths: {
        '/api/mock': {
          patch: {
            parameters: [
              {
                name: 'stable',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    required: ['name'],
                    properties: {
                      name: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    expect(JSON.stringify(document)).not.toContain('beta');
    expect(JSON.stringify(document)).not.toContain('betaParameter');
    expect(JSON.stringify(document)).not.toContain(devFeatureSchemaExtension);
  });

  it('should keep dev feature schema properties and parameters without exposing the internal marker when dev features are enabled', () => {
    setDevFeaturesEnabled(true);

    const document = createDocument();
    removeDevFeatureParameters(document);
    removeDevFeatureSchemaProperties(document);

    expect(document).toMatchObject({
      paths: {
        '/api/mock': {
          patch: {
            parameters: [
              {
                name: 'stable',
                in: 'query',
                schema: { type: 'string' },
              },
              {
                name: 'betaParameter',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    required: ['name', 'beta'],
                    properties: {
                      beta: {
                        type: 'boolean',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    expect(JSON.stringify(document)).not.toContain(devFeatureSchemaExtension);
  });

  it('should remove dev feature operations when dev features are disabled', () => {
    Reflect.set(EnvSet.values, 'isCloud', true);
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    const document = removeUnnecessaryOperations(createDevFeatureOperationDocument());

    expect(document.paths).toMatchObject({
      '/api/stable': {
        get: {
          tags: ['Stable'],
        },
      },
    });
    expect(document.paths).not.toHaveProperty('/api/dev');
  });

  it('should expose external identity lookup parameters only when dev features are enabled', async () => {
    const loadDocument = async () =>
      JSON.parse(
        await fs.readFile(new URL('../../admin-user/search.openapi.json', import.meta.url), 'utf8')
      ) as DeepPartial<OpenAPIV3.Document>;

    setDevFeaturesEnabled(false);
    const stableDocument = removeUnnecessaryOperations(await loadDocument());
    removeDevFeatureParameters(stableDocument);
    removeDevFeatureSchemaProperties(stableDocument);
    expect(stableDocument.paths?.['/api/users']?.get?.parameters).toEqual([]);

    setDevFeaturesEnabled(true);
    const devDocument = removeUnnecessaryOperations(await loadDocument());
    removeDevFeatureParameters(devDocument);
    removeDevFeatureSchemaProperties(devDocument);
    expect(devDocument.paths?.['/api/users']?.get?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'identityType' }),
        expect.objectContaining({ name: 'identityProvider' }),
        expect.objectContaining({ name: 'identityId' }),
      ])
    );
    expect(JSON.stringify(devDocument)).not.toContain(devFeatureSchemaExtension);
  });
});
