import * as SwaggerParser from '@apidevtools/swagger-parser';
import Validator from 'openapi-schema-validator';
import { type OpenAPIV3 } from 'openapi-types';

import { adminTenantApi } from '#src/api/api.js';

const { default: OpenApiSchemaValidator } = Validator;

describe('.well-known openapi.json endpoints', () => {
  it.each(['management', 'experience'])('should return %s.openapi.json', async (type) => {
    const response = await adminTenantApi.get(`.well-known/${type}.openapi.json`);

    expect(response).toHaveProperty('status', 200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const json = await response.json<OpenAPIV3.Document>();

    const validator = new OpenApiSchemaValidator({ version: 3 });
    const result = validator.validate(json);
    expect(result.errors).toEqual([]);
    await expect(SwaggerParser.default.validate(json)).resolves.not.toThrow();
  });
});
