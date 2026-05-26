import { type OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';

import { devFeatureSchemaExtension, removeUnnecessaryOperations } from './general.js';

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
  afterEach(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('should remove dev feature schema properties when dev features are disabled', () => {
    setDevFeaturesEnabled(false);

    const document = removeUnnecessaryOperations(createDocument());

    expect(document).toMatchObject({
      paths: {
        '/api/mock': {
          patch: {
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
    expect(JSON.stringify(document)).not.toContain(devFeatureSchemaExtension);
  });

  it('should keep dev feature schema properties without exposing the internal marker when dev features are enabled', () => {
    setDevFeaturesEnabled(true);

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
