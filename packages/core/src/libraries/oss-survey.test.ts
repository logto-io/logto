import { CompanySize, Project } from '@logto/schemas';
import ky from 'ky';

import { EnvSet } from '#src/env-set/index.js';

const { jest } = import.meta;

const post = jest.spyOn(ky, 'post');

const { reportOssSurvey } = await import('./oss-survey.js');

const mockPayload = {
  emailAddress: 'dev@example.com',
  newsletter: true,
  project: Project.Company,
  companyName: 'Acme',
  companySize: CompanySize.Scale3,
} as const;

/* eslint-disable @silverhand/fp/no-mutating-methods */
describe('reportOssSurvey', () => {
  const originalEndpoint = EnvSet.values.ossSurveyEndpoint;

  beforeEach(() => {
    post.mockReset();
    Object.defineProperty(EnvSet.values, 'ossSurveyEndpoint', {
      configurable: true,
      value: undefined,
    });
  });

  afterAll(() => {
    Object.defineProperty(EnvSet.values, 'ossSurveyEndpoint', {
      configurable: true,
      value: originalEndpoint,
    });
    post.mockRestore();
  });

  it('does nothing when the survey endpoint is not configured', () => {
    reportOssSurvey(mockPayload);

    expect(post).not.toHaveBeenCalled();
  });

  it('posts the survey payload with fire-and-forget request settings', () => {
    Object.defineProperty(EnvSet.values, 'ossSurveyEndpoint', {
      configurable: true,
      value: 'https://survey.logto.app/api/survey',
    });
    post.mockResolvedValue({} as never);

    reportOssSurvey(mockPayload);

    expect(post).toHaveBeenCalledWith('https://survey.logto.app/api/survey', {
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Logto OSS (https://logto.io/)',
      },
      json: mockPayload,
      retry: { limit: 0 },
      timeout: 3000,
    });
  });

  it('swallows outbound request failures', async () => {
    Object.defineProperty(EnvSet.values, 'ossSurveyEndpoint', {
      configurable: true,
      value: 'https://survey.logto.app/api/survey',
    });
    post.mockRejectedValue(new Error('network error'));

    expect(() => {
      reportOssSurvey(mockPayload);
    }).not.toThrow();

    await Promise.resolve();
  });
});
/* eslint-enable @silverhand/fp/no-mutating-methods */
