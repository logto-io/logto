import { ApplicationType } from '@logto/schemas';

import {
  createApplication,
  deleteApplication,
  getApplication,
  updateApplication,
} from '#src/api/index.js';
import { devFeatureTest, generateTestName } from '#src/utils.js';

devFeatureTest.describe('application maxAllowedSessions', () => {
  devFeatureTest.it('should create application with maxAllowedSessions and get it', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.Traditional, {
      customClientMetadata: { maxAllowedSessions: 2 },
    });

    try {
      expect(application.customClientMetadata.maxAllowedSessions).toBe(2);

      const fetched = await getApplication(application.id);
      expect(fetched.customClientMetadata.maxAllowedSessions).toBe(2);
    } finally {
      await deleteApplication(application.id);
    }
  });

  devFeatureTest.it('should update maxAllowedSessions and get updated value', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.Traditional);

    try {
      await updateApplication(application.id, {
        customClientMetadata: { maxAllowedSessions: 5 },
      });

      const fetched = await getApplication(application.id);
      expect(fetched.customClientMetadata.maxAllowedSessions).toBe(5);
    } finally {
      await deleteApplication(application.id);
    }
  });

  devFeatureTest.it('should remove maxAllowedSessions after update without the field', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.Traditional, {
      customClientMetadata: { maxAllowedSessions: 4 },
    });

    try {
      await updateApplication(application.id, {
        customClientMetadata: { idTokenTtl: 3600 },
      });

      const fetched = await getApplication(application.id);
      expect(fetched.customClientMetadata.maxAllowedSessions).toBeUndefined();
    } finally {
      await deleteApplication(application.id);
    }
  });
});
