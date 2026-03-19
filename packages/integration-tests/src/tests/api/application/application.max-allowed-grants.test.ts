import { ApplicationType } from '@logto/schemas';

import {
  createApplication,
  deleteApplication,
  getApplication,
  updateApplication,
} from '#src/api/index.js';
import { devFeatureTest, generateTestName } from '#src/utils.js';

devFeatureTest.describe('application maxAllowedGrants', () => {
  devFeatureTest.it('should create application with maxAllowedGrants and get it', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.Traditional, {
      customClientMetadata: { maxAllowedGrants: 2 },
    });

    try {
      expect(application.customClientMetadata.maxAllowedGrants).toBe(2);

      const fetched = await getApplication(application.id);
      expect(fetched.customClientMetadata.maxAllowedGrants).toBe(2);
    } finally {
      await deleteApplication(application.id);
    }
  });

  devFeatureTest.it('should update maxAllowedGrants and get updated value', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.Traditional);

    try {
      await updateApplication(application.id, {
        customClientMetadata: { maxAllowedGrants: 5 },
      });

      const fetched = await getApplication(application.id);
      expect(fetched.customClientMetadata.maxAllowedGrants).toBe(5);
    } finally {
      await deleteApplication(application.id);
    }
  });

  devFeatureTest.it('should remove maxAllowedGrants after update without the field', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.Traditional, {
      customClientMetadata: { maxAllowedGrants: 4 },
    });

    try {
      await updateApplication(application.id, {
        customClientMetadata: { idTokenTtl: 3600 },
      });

      const fetched = await getApplication(application.id);
      expect(fetched.customClientMetadata.maxAllowedGrants).toBeUndefined();
    } finally {
      await deleteApplication(application.id);
    }
  });
});
