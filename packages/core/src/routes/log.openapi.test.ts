import fs from 'node:fs/promises';

import Router from 'koa-router';
import { type OpenAPIV3 } from 'openapi-types';

import { resetDevFeaturesEnabled, setDevFeaturesEnabled } from '#src/test-utils/dev-features.js';
import { type DeepPartial, MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import hookRoutes from './hook.js';
import logRoutes from './log.js';
import {
  assembleSwaggerDocument,
  buildManagementApiBaseDocument,
} from './swagger/utils/documents.js';
import { devFeatureSchemaExtension } from './swagger/utils/general.js';
import { buildRouterObjects, groupRoutesByPath } from './swagger/utils/operation.js';
import { type ManagementApiRouter } from './types.js';

const loadSupplement = async (relativePath: string): Promise<DeepPartial<OpenAPIV3.Document>> =>
  JSON.parse(
    await fs.readFile(new URL(relativePath, import.meta.url), 'utf8')
  ) as DeepPartial<OpenAPIV3.Document>;

const buildLogOpenApiDocument = async () => {
  const router: ManagementApiRouter = new Router();
  const tenant = new MockTenant();

  hookRoutes(router, tenant);
  logRoutes(router, tenant);

  const routes = buildRouterObjects([router]);
  const { pathMap, tags } = groupRoutesByPath(routes);
  const baseDocument = buildManagementApiBaseDocument(pathMap, tags, 'https://logto.test');
  const supplements = await Promise.all([
    loadSupplement('./hooks.openapi.json'),
    loadSupplement('./log.openapi.json'),
  ]);

  return assembleSwaggerDocument(supplements, baseDocument, createContextWithRouteParameters());
};

const isSchemaObject = (
  value: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): value is OpenAPIV3.SchemaObject => Boolean(value && !('$ref' in value));

const getJsonResponseSchema = (document: OpenAPIV3.Document, path: string) => {
  const response = document.paths[path]?.get?.responses['200'];

  if (!response || !('content' in response)) {
    return;
  }

  return response.content?.['application/json']?.schema;
};

const getResponsePayloadProperties = (
  document: OpenAPIV3.Document,
  path: string,
  isArray: boolean
) => {
  const schema = getJsonResponseSchema(document, path);

  if (!isSchemaObject(schema)) {
    return;
  }

  const itemSchema = isArray && 'items' in schema ? schema.items : schema;
  const payloadSchema = isSchemaObject(itemSchema) ? itemSchema.properties?.payload : undefined;

  return isSchemaObject(payloadSchema) ? payloadSchema.properties : undefined;
};

const webhookLogPaths = [
  ['/api/hooks/{id}/recent-logs', true],
  ['/api/logs', true],
  ['/api/logs/{id}', false],
] as const;

describe('webhook log payload OpenAPI fields', () => {
  afterEach(resetDevFeaturesEnabled);

  it('hides the retry fields without dev features', async () => {
    setDevFeaturesEnabled(false);
    const document = await buildLogOpenApiDocument();

    for (const [path, isArray] of webhookLogPaths) {
      const payloadProperties = getResponsePayloadProperties(document, path, isArray);
      expect(payloadProperties).toBeDefined();
      expect(payloadProperties).not.toHaveProperty('attempts');
      expect(payloadProperties).not.toHaveProperty('nextAttemptAt');
      expect(payloadProperties).not.toHaveProperty('redeliveredFrom');
    }

    expect(JSON.stringify(document)).not.toContain(devFeatureSchemaExtension);
  });

  it('exposes the retry fields with dev features', async () => {
    setDevFeaturesEnabled(true);
    const document = await buildLogOpenApiDocument();

    for (const [path, isArray] of webhookLogPaths) {
      const payloadProperties = getResponsePayloadProperties(document, path, isArray);
      expect(payloadProperties).toMatchObject({
        attempts: {
          type: 'number',
          description: 'The number of delivery attempts made for this webhook event.',
        },
        nextAttemptAt: {
          type: 'number',
          description:
            'The scheduled time of the next retry attempt, in unix milliseconds. Present only while a retry is pending.',
        },
        redeliveredFrom: {
          type: 'string',
          description:
            'The ID of the failed webhook log entry that this manual redelivery was triggered from.',
        },
      });
    }

    expect(JSON.stringify(document)).not.toContain(devFeatureSchemaExtension);
  });
});
