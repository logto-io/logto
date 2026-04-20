import { CompanySize, Project } from '@logto/schemas';
import type { KyInstance } from 'node_modules/ky/distribution/types/ky';

import { createOssSurveyReporter } from './utils';

const mockPayload = {
  emailAddress: 'dev@example.com',
  newsletter: true,
  project: Project.Company,
  companyName: 'Acme',
  companySize: CompanySize.Scale3,
} as const;

describe('reportOssSurvey', () => {
  const api = {
    post: jest.fn<ReturnType<KyInstance['post']>, Parameters<KyInstance['post']>>(),
  } satisfies Pick<KyInstance, 'post'>;

  beforeEach(() => {
    api.post.mockResolvedValue({} as never);
  });

  it('posts the survey payload to the OSS survey endpoint', () => {
    const reportOssSurvey = createOssSurveyReporter(api, 'https://survey.logto.app');

    reportOssSurvey(mockPayload);

    expect(api.post).toHaveBeenCalledWith('https://survey.logto.app/api/surveys', {
      keepalive: true,
      json: mockPayload,
      retry: { limit: 0 },
    });
  });

  it('does nothing when the OSS survey endpoint is not configured', () => {
    const reportOssSurvey = createOssSurveyReporter(api);

    reportOssSurvey(mockPayload);

    expect(api.post).not.toHaveBeenCalled();
  });

  it('does nothing when the OSS survey endpoint is invalid', () => {
    const reportOssSurvey = createOssSurveyReporter(api, 'not-a-url');

    reportOssSurvey(mockPayload);

    expect(api.post).not.toHaveBeenCalled();
  });

  it('handles OSS survey endpoint values with trailing slash', () => {
    const reportOssSurvey = createOssSurveyReporter(api, 'https://survey.logto.app/');

    reportOssSurvey(mockPayload);

    expect(api.post).toHaveBeenCalledWith(
      'https://survey.logto.app/api/surveys',
      expect.any(Object)
    );
  });

  it('swallows request failures', async () => {
    const reportOssSurvey = createOssSurveyReporter(api, 'https://survey.logto.app');
    api.post.mockRejectedValue(new Error('network error'));

    expect(() => {
      reportOssSurvey(mockPayload);
    }).not.toThrow();

    await Promise.resolve();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
