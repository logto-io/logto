import { type OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { assembleSwaggerDocument } from './documents.js';
import { devFeatureSchemaExtension } from './general.js';

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Tests need to cover both dev-feature states.
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = isDevFeaturesEnabled;
};

/**
 * Mimics the generated base document: the user payload schema comes from the env-free zod guards,
 * so `cimdClientId` appears in `properties` and `required` without any dev-feature marker,
 * including occurrences nested in `oneOf` branches (e.g. the JWT customizer context schemas).
 */
const createBaseDocument = (): OpenAPIV3.Document => ({
  openapi: '3.0.1',
  info: {
    title: 'Test',
    version: '1.0.0',
  },
  paths: {
    '/api/users/{userId}': {
      get: {
        responses: {
          '200': {
            description: 'ok',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id', 'cimdClientId'],
                  properties: {
                    id: { type: 'string' },
                    cimdClientId: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/configs/jwt-customizer': {
      get: {
        responses: {
          '200': {
            description: 'ok',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      type: 'object',
                      properties: {
                        contextSample: {
                          type: 'object',
                          properties: {
                            user: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                cimdClientId: { type: 'string', nullable: true },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
});

const createMarkedPropertySchema = () =>
  ({
    description: 'Dev feature. The CIMD client identifier.',
    [devFeatureSchemaExtension]: true,
  }) satisfies OpenAPIV3.SchemaObject & Record<typeof devFeatureSchemaExtension, true>;

const createSupplementDocument = (): DeepPartial<OpenAPIV3.Document> => ({
  paths: {
    '/api/users/{userId}': {
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    cimdClientId: createMarkedPropertySchema(),
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

const assemble = () =>
  assembleSwaggerDocument(
    [createSupplementDocument()],
    createBaseDocument(),
    createContextWithRouteParameters()
  );

describe('assembleSwaggerDocument', () => {
  afterEach(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('should prune dev feature properties from the assembled document when dev features are disabled', () => {
    setDevFeaturesEnabled(false);

    const document = assemble();

    expect(JSON.stringify(document)).not.toContain('cimdClientId');
    expect(JSON.stringify(document)).not.toContain(devFeatureSchemaExtension);
    expect(document.paths['/api/users/{userId}']?.get?.responses['200']).toMatchObject({
      content: {
        'application/json': {
          schema: {
            required: ['id'],
            properties: { id: { type: 'string' } },
          },
        },
      },
    });
  });

  it('should keep dev feature properties without the internal marker when dev features are enabled', () => {
    setDevFeaturesEnabled(true);

    const document = assemble();

    expect(JSON.stringify(document)).not.toContain(devFeatureSchemaExtension);
    expect(document.paths['/api/users/{userId}']?.get?.responses['200']).toMatchObject({
      content: {
        'application/json': {
          schema: {
            required: ['id', 'cimdClientId'],
            properties: {
              cimdClientId: { description: 'Dev feature. The CIMD client identifier.' },
            },
          },
        },
      },
    });
    expect(
      JSON.stringify(document.paths['/api/configs/jwt-customizer']?.get?.responses['200'])
    ).toContain('cimdClientId');
  });
});
