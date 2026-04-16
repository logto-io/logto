import { CompanySize, Project } from '@logto/schemas';

import { reportOssSurvey } from './report-oss-survey';

const mockPayload = {
  emailAddress: 'dev@example.com',
  newsletter: true,
  project: Project.Company,
  companyName: 'Acme',
  companySize: CompanySize.Scale3,
} as const;

/* eslint-disable @silverhand/fp/no-mutating-methods */
describe('reportOssSurvey', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: jest.fn(async () => ({ ok: true })),
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: originalFetch,
    });
    jest.clearAllMocks();
  });

  it('posts the survey payload to the OSS survey endpoint', () => {
    reportOssSurvey(mockPayload);

    expect(global.fetch).toHaveBeenCalledWith('/api/oss-survey/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify(mockPayload),
    });
  });

  it('swallows request failures', async () => {
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: jest.fn(async () => {
        throw new Error('network error');
      }),
    });

    expect(() => {
      reportOssSurvey(mockPayload);
    }).not.toThrow();

    await Promise.resolve();
  });
});
/* eslint-enable @silverhand/fp/no-mutating-methods */
