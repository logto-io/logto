import * as SwaggerParser from '@apidevtools/swagger-parser';
import Validator from 'openapi-schema-validator';
import type { OpenAPI } from 'openapi-types';

import { api } from '#src/api/index.js';

const { default: OpenApiSchemaValidator } = Validator;

describe('Swagger check', () => {
  it('should provide a valid swagger.json', async () => {
    const response = await api.get('swagger.json');
    expect(response).toHaveProperty('statusCode', 200);
    expect(response.headers['content-type']).toContain('application/json');

    // Use multiple validators to be more confident
    expect(async () => {
      const object: unknown = JSON.parse(response.body);

      const validator = new OpenApiSchemaValidator({ version: 3 });
      const result = validator.validate(object as OpenAPI.Document);
      expect(result.errors).toEqual([]);

      await expect(
        SwaggerParser.default.validate(object as OpenAPI.Document)
      ).resolves.not.toThrow();
    }).not.toThrow();
  });
});
