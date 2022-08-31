import OpenApiSchemaValidator from 'openapi-schema-validator';
import { OpenAPI } from 'openapi-types';

import { api } from '@/api';

describe('Swagger check', () => {
  it('should provide a valid swagger.json', async () => {
    const response = await api.get('swagger.json');
    expect(response).toHaveProperty('statusCode', 200);
    expect(response.headers['content-type']).toContain('application/json');

    expect(() => {
      // eslint-disable-next-line @silverhand/fp/no-let
      let object: unknown;

      try {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        object = JSON.parse(response.body);
      } catch {
        throw new Error('Failed to parse response!');
      }
      const validator = new OpenApiSchemaValidator({ version: 3 });
      const result = validator.validate(object as OpenAPI.Document);
      expect(result.errors).toEqual([]);
    }).not.toThrow();
  });
});
