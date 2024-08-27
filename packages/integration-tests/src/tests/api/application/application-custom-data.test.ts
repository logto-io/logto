import { ApplicationType } from '@logto/schemas';

import {
  createApplication,
  deleteApplication,
  getApplication,
  patchApplicationCustomData,
  updateApplication,
} from '#src/api/application.js';

describe('application custom data API', () => {
  it('should patch application custom data successfully', async () => {
    const applicationName = 'test-create-app';
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(applicationName, applicationType);

    const customData = { key: 'value' };
    const result = await patchApplicationCustomData(application.id, customData);

    expect(result.key).toEqual(customData.key);

    const fetchedApplication = await getApplication(application.id);

    expect(fetchedApplication.customData.key).toEqual(customData.key);

    await patchApplicationCustomData(application.id, { key: 'new-value', test: 'foo' });

    const updatedApplication = await getApplication(application.id);
    expect(updatedApplication.customData.key).toEqual('new-value');
    expect(updatedApplication.customData.test).toEqual('foo');

    await deleteApplication(application.id);
  });

  it('should put application custom data successfully', async () => {
    const applicationName = 'test-create-app';
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(applicationName, applicationType);
    const customData = { key: 'foo' };

    const result = await patchApplicationCustomData(application.id, customData);

    expect(result.key).toEqual(customData.key);

    await updateApplication(application.id, {
      customData: {},
    });

    const fetchedApplication = await getApplication(application.id);
    expect(Object.keys(fetchedApplication.customData)).toHaveLength(0);
  });
});
