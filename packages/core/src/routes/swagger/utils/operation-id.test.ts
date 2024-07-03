import { OpenAPIV3 } from 'openapi-types';

import { buildOperationId, customRoutes } from './operation-id.js';

describe('buildOperationId', () => {
  it('should return the custom operation id if it exists', () => {
    for (const [path, operationId] of Object.entries(customRoutes)) {
      const [method, pathSegments] = path.split(' ');
      expect(buildOperationId(method! as OpenAPIV3.HttpMethods, pathSegments!)).toBe(operationId);
    }
  });

  it('should skip interactions APIs', () => {
    expect(buildOperationId(OpenAPIV3.HttpMethods.GET, '/interaction/footballs')).toBeUndefined();
  });

  it('should handle JIT APIs', () => {
    expect(buildOperationId(OpenAPIV3.HttpMethods.GET, '/footballs/:footballId/jit/bars')).toBe(
      'ListFootballJitBars'
    );
  });

  it('should throw if the path is invalid', () => {
    expect(() =>
      buildOperationId(OpenAPIV3.HttpMethods.GET, '/footballs/:footballId/bar/baz')
    ).toThrow();
    expect(() => buildOperationId(OpenAPIV3.HttpMethods.GET, '/')).toThrow();
  });

  it('should singularize the item for POST requests', () => {
    expect(buildOperationId(OpenAPIV3.HttpMethods.POST, '/footballs/:footballId/bars')).toBe(
      'CreateFootballBar'
    );
  });

  it('should singularize for single item requests', () => {
    expect(buildOperationId(OpenAPIV3.HttpMethods.DELETE, '/footballs/:footballId')).toBe(
      'DeleteFootball'
    );
  });

  it('should use "Get" if the last item is singular', () => {
    expect(buildOperationId(OpenAPIV3.HttpMethods.GET, '/footballs/:footballId/bar')).toBe(
      'GetFootballBar'
    );
  });

  it('should use "List" if the last item is plural', () => {
    expect(buildOperationId(OpenAPIV3.HttpMethods.GET, '/footballs/:footballId/bars')).toBe(
      'ListFootballBars'
    );
  });
});
