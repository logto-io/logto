import * as SwaggerParser from '@apidevtools/swagger-parser';
import Validator from 'openapi-schema-validator';
import { type OpenAPIV3 } from 'openapi-types';

import { adminTenantApi } from '#src/api/api.js';

const { default: OpenApiSchemaValidator } = Validator;

describe('.well-known openapi.json endpoints', () => {
  it.each(['management', 'experience', 'user'])('should return %s.openapi.json', async (type) => {
    const response = await adminTenantApi.get(`.well-known/${type}.openapi.json`);

    expect(response).toHaveProperty('status', 200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const json = await response.json<OpenAPIV3.Document>();

    const validator = new OpenApiSchemaValidator({ version: 3 });
    const result = validator.validate(json);
    expect(result.errors).toEqual([]);
    await expect(SwaggerParser.default.validate(json)).resolves.not.toThrow();
  });

  // Arbitrary JSON object fields must declare `additionalProperties` so that
  // openapi-typescript emits `{ [k: string]: unknown }` instead of
  // `Record<string, never>`, which would forbid all properties at the type level.
  it('emits arbitrary-object fields as open objects', async () => {
    const response = await adminTenantApi.get('.well-known/management.openapi.json');
    const json = await response.json<OpenAPIV3.Document>();

    const requestBody = json.paths['/api/organizations']?.post?.requestBody as
      | OpenAPIV3.RequestBodyObject
      | undefined;
    const bodySchema = requestBody?.content['application/json']?.schema as
      | OpenAPIV3.SchemaObject
      | undefined;
    const customData = bodySchema?.properties?.customData as OpenAPIV3.SchemaObject | undefined;

    expect(customData?.type).toBe('object');
    expect(customData?.additionalProperties).toBe(true);
  });
});
