import { type OpenAPIV3 } from 'openapi-types';

import { type DeepPartial } from '#src/test-utils/tenant.js';

import { devFeatureSchemaExtension, removeUnnecessaryOperations } from './general.js';

const createDevFeatureBooleanSchema = () =>
  ({
    type: 'boolean',
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

describe('swagger general utils', () => {
  it('should keep dev feature schema properties without exposing the internal marker', () => {
    const document = removeUnnecessaryOperations(createDocument());

    expect(document).toMatchObject({
      paths: {
        '/api/mock': {
          patch: {
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
});
