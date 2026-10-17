import { EnvSet } from '#src/env-set/index.js';

import { removeDevFeatureParameters } from '../swagger/utils/general.js';

import document from './search.openapi.json' with { type: 'json' };

const original = EnvSet.values.isDevFeaturesEnabled;

afterEach(() => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', original);
});

it.each([true, false])('documents suspension filtering only with dev features=%s', (enabled) => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', enabled);
  const copy = structuredClone(document);
  removeDevFeatureParameters(copy);

  expect(copy.paths['/api/users'].get.parameters.some(({ name }) => name === 'isSuspended')).toBe(
    enabled
  );
  expect(JSON.stringify(copy)).not.toContain('x-logto-dev-feature');
});
