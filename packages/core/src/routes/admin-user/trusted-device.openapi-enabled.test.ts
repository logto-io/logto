import { EnvSet } from '#src/env-set/index.js';

Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);

const { buildManagementApiBaseDocument, getSupplementDocuments } = await import(
  '../swagger/utils/documents.js'
);

it('keeps trusted-device OpenAPI when dev features are enabled', async () => {
  const documents = await getSupplementDocuments('admin-user');
  const baseDocument = buildManagementApiBaseDocument(new Map(), new Set(), 'https://logto.test');

  expect(JSON.stringify(documents)).toContain('/api/users/{userId}/trusted-devices');
  expect(baseDocument.components?.parameters).toHaveProperty('trustedDeviceId');
  expect(baseDocument.components?.parameters).toHaveProperty('trustedDeviceId-root');
});
