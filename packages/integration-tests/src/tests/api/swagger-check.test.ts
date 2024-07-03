import * as SwaggerParser from '@apidevtools/swagger-parser';
import Validator from 'openapi-schema-validator';
import type { OpenAPI } from 'openapi-types';

import * as apis from '#src/api/index.js';

const { default: OpenApiSchemaValidator } = Validator;

describe('Swagger check', () => {
  it.each(['api', 'adminTenantApi'] as const)(
    'should provide a valid swagger.json for %s',
    async (apiName) => {
      const api = apis[apiName];
      const response = await api.get('swagger.json');
      expect(response).toHaveProperty('status', 200);
      expect(response.headers.get('content-type')).toContain('application/json');

      // Use multiple validators to be more confident
      const object: unknown = await response.json();

      const validator = new OpenApiSchemaValidator({ version: 3 });
      const result = validator.validate(object as OpenAPI.Document);
      expect(result.errors).toEqual([]);
      await expect(
        SwaggerParser.default.validate(object as OpenAPI.Document)
      ).resolves.not.toThrow();
    }
  );
});
