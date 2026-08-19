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
 * Mimics the generated base document: the payload schema comes from the env-free zod guards, so
 * the dev-feature property appears in `properties` and `required` without any marker — only the
 * supplement carries it, and it reaches the base property when the documents merge.
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
                  required: ['id', 'betaFlag'],
                  properties: {
                    id: { type: 'string' },
                    betaFlag: { type: 'string', nullable: true },
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

const createMarkedPropertySchema = () =>
  ({
    description: 'Dev feature. The beta flag.',
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
                    betaFlag: createMarkedPropertySchema(),
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

    expect(JSON.stringify(document)).not.toContain('betaFlag');
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
            required: ['id', 'betaFlag'],
            properties: {
              betaFlag: { description: 'Dev feature. The beta flag.' },
            },
          },
        },
      },
    });
  });
});
