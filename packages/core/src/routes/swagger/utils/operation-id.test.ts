import { OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';

import { buildOperationId, getCustomRoutes } from './operation-id.js';

describe('buildOperationId', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const setDevFeaturesEnabled = (enabled: boolean) => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', enabled);
  };

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('should return the custom operation id if it exists', () => {
    for (const [path, operationId] of Object.entries(getCustomRoutes())) {
      const [method, pathSegments] = path.split(' ');
      expect(buildOperationId(method! as OpenAPIV3.HttpMethods, pathSegments!)).toBe(operationId);
    }
  });

  it('should only expose OSS survey custom routes when dev features are enabled', () => {
    setDevFeaturesEnabled(false);
    expect(getCustomRoutes()).toHaveProperty('get /configs/oidc/session', 'GetOidcSessionConfig');
    expect(getCustomRoutes()).toHaveProperty(
      'patch /configs/oidc/session',
      'UpdateOidcSessionConfig'
    );
    expect(getCustomRoutes()).not.toHaveProperty('post /oss-survey/report');
    expect(() => buildOperationId(OpenAPIV3.HttpMethods.POST, '/oss-survey/report')).toThrow();

    setDevFeaturesEnabled(true);
    expect(getCustomRoutes()).toHaveProperty('get /configs/oidc/session', 'GetOidcSessionConfig');
    expect(getCustomRoutes()).toHaveProperty(
      'patch /configs/oidc/session',
      'UpdateOidcSessionConfig'
    );
    expect(getCustomRoutes()).toHaveProperty('post /oss-survey/report', 'ReportOssSurvey');
    expect(buildOperationId(OpenAPIV3.HttpMethods.POST, '/oss-survey/report')).toBe(
      'ReportOssSurvey'
    );
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
