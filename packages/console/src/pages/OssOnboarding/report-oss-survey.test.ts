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

  const reportOssSurvey = createOssSurveyReporter(api);

  beforeEach(() => {
    api.post.mockResolvedValue({} as never);
  });

  it('posts the survey payload to the OSS survey endpoint', () => {
    reportOssSurvey(mockPayload);

    expect(api.post).toHaveBeenCalledWith('api/oss-survey/report', {
      keepalive: true,
      json: mockPayload,
      retry: { limit: 0 },
    });
  });

  it('swallows request failures', async () => {
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
