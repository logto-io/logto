import { OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';

import { buildOperationId, customRoutes, throwByDifference } from './operation-id.js';

describe('buildOperationId', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const originalIsProduction = EnvSet.values.isProduction;
  const originalIsUnitTest = EnvSet.values.isUnitTest;

  afterEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
    Reflect.set(EnvSet.values, 'isProduction', originalIsProduction);
    Reflect.set(EnvSet.values, 'isUnitTest', originalIsUnitTest);
  });

  it('should return the custom operation id if it exists', () => {
    for (const [path, operationId] of Object.entries(customRoutes)) {
      const [method, pathSegments] = path.split(' ');
      expect(buildOperationId(method! as OpenAPIV3.HttpMethods, pathSegments!)).toBe(operationId);
    }
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

  it('should ignore dev feature custom routes when dev features are disabled', () => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
    Reflect.set(EnvSet.values, 'isProduction', false);
    Reflect.set(EnvSet.values, 'isUnitTest', false);

    const builtCustomRoutes = new Set(
      Object.keys(customRoutes).filter((route) => !route.includes('/configs/inline-hooks'))
    );

    expect(() => {
      throwByDifference(builtCustomRoutes);
    }).not.toThrow();
  });
});
