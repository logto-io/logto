import { ApplicationType } from '@logto/schemas';

import { createApplication, deleteApplication, updateApplication } from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureTest, generateUuid } from '#src/utils.js';

devFeatureTest.describe('application unknown session fallback uri API tests', () => {
  describe('create application', () => {
    const unknownSessionFallbackUri = 'https://example.com';

    it('should throw invalid_unknown_session_fallback_uri error when creating application with invalid unknown session fallback uri', async () => {
      await expectRejects(
        createApplication(generateUuid(), ApplicationType.SPA, {
          unknownSessionFallbackUri: 'invalid-uri',
        }),
        { code: 'application.invalid_unknown_session_fallback_uri', status: 400 }
      );
    });

    it('should throw unknown_session_fallback_uri_not_supported error when creating machine-to-machine application', async () => {
      await expectRejects(
        createApplication(generateUuid(), ApplicationType.MachineToMachine, {
          unknownSessionFallbackUri,
        }),
        { code: 'application.unknown_session_fallback_uri_not_supported', status: 400 }
      );
    });

    it('should throw unknown_session_fallback_uri_not_supported error when creating third-party application', async () => {
      await expectRejects(
        createApplication(generateUuid(), ApplicationType.Traditional, {
          unknownSessionFallbackUri,
          isThirdParty: true,
        }),
        { code: 'application.unknown_session_fallback_uri_not_supported', status: 400 }
      );
    });

    it('should create application with unknown session fallback uri successfully', async () => {
      const application = await createApplication(generateUuid(), ApplicationType.SPA, {
        unknownSessionFallbackUri,
      });

      expect(application.unknownSessionFallbackUri).toBe(unknownSessionFallbackUri);

      await deleteApplication(application.id);
    });
  });

  describe('update application', () => {
    it('should throw invalid_unknown_session_fallback_uri error when updating application with invalid unknown session fallback uri', async () => {
      const application = await createApplication(generateUuid(), ApplicationType.SPA);
      await expectRejects(
        updateApplication(application.id, { unknownSessionFallbackUri: 'invalid-uri' }),
        {
          code: 'application.invalid_unknown_session_fallback_uri',
          status: 400,
        }
      );
      await deleteApplication(application.id);
    });

    it('should throw unknown_session_fallback_uri_not_supported error when updating machine-to-machine application', async () => {
      const application = await createApplication(generateUuid(), ApplicationType.MachineToMachine);
      await expectRejects(
        updateApplication(application.id, { unknownSessionFallbackUri: 'https://example.com' }),
        {
          code: 'application.unknown_session_fallback_uri_not_supported',
          status: 400,
        }
      );
      await deleteApplication(application.id);
    });

    it('should throw unknown_session_fallback_uri_not_supported error when updating third-party application', async () => {
      const application = await createApplication(generateUuid(), ApplicationType.Traditional, {
        isThirdParty: true,
      });
      await expectRejects(
        updateApplication(application.id, { unknownSessionFallbackUri: 'https://example.com' }),
        {
          code: 'application.unknown_session_fallback_uri_not_supported',
          status: 400,
        }
      );
      await deleteApplication(application.id);
    });

    it('should update application with unknown session fallback uri successfully', async () => {
      const application = await createApplication(generateUuid(), ApplicationType.SPA);
      const unknownSessionFallbackUri = 'https://example.com';

      const updatedApplication = await updateApplication(application.id, {
        unknownSessionFallbackUri,
      });

      expect(updatedApplication.unknownSessionFallbackUri).toBe(unknownSessionFallbackUri);

      const removedUnknownSessionFallbackUriApplication = await updateApplication(application.id, {
        unknownSessionFallbackUri: null,
      });

      expect(removedUnknownSessionFallbackUriApplication.unknownSessionFallbackUri).toBe(null);

      await deleteApplication(application.id);
    });
  });
});
