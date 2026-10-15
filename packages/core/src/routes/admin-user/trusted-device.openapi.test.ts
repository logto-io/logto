import { EnvSet } from '#src/env-set/index.js';

Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

const { buildManagementApiBaseDocument, buildUserApiBaseDocument, getSupplementDocuments } =
  await import('../swagger/utils/documents.js');

it('exposes trusted-device OpenAPI surfaces without dev features', async () => {
  const documents = await getSupplementDocuments();
  const managementBaseDocument = buildManagementApiBaseDocument(
    new Map(),
    new Set(),
    'https://logto.test'
  );
  const userBaseDocument = buildUserApiBaseDocument(new Map(), new Set(), 'https://logto.test');
  const serializedDocuments = JSON.stringify(documents);

  expect(serializedDocuments).toContain('/api/users/{userId}/trusted-devices');
  expect(serializedDocuments).toContain('/api/my-account/trusted-devices');
  expect(serializedDocuments).toContain('/api/experience/profile/trusted-device');
  expect(managementBaseDocument.components?.parameters).toHaveProperty('trustedDeviceId');
  expect(managementBaseDocument.components?.parameters).toHaveProperty('trustedDeviceId-root');
  expect(userBaseDocument.components?.parameters).toHaveProperty('trustedDeviceId');
  expect(userBaseDocument.components?.parameters).toHaveProperty('trustedDeviceId-root');
});
