import { CompanySize, Project, type OssUserOnboardingData } from '@logto/schemas';
import type { Options } from 'ky';

import type { OssOnboardingFormData } from './utils';

// Module-level mocks for env constants. Must be declared before importing the module under test.
// eslint-disable-next-line @silverhand/fp/no-let
let mockIsDevFeaturesEnabled = true;
// eslint-disable-next-line @silverhand/fp/no-let
let mockOssSurveyEndpoint: string | undefined = 'https://survey.example.com';

const mockKyPost = jest.fn<Promise<{ ok: boolean }>, [URL, Options?]>();
const mockKyOptions: { current?: Options } = {};
const mockKyCreate = jest.fn((options?: Options) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  mockKyOptions.current = options;

  return {
    post: async (...args: [URL, Options?]) => {
      const retryLimit =
        options?.retry && typeof options.retry !== 'number' ? (options.retry.limit ?? 0) : 0;
      const retryDelay =
        options?.retry && typeof options.retry !== 'number' ? (options.retry.delay?.(1) ?? 0) : 0;

      try {
        const response = await mockKyPost(...args);
        return response;
      } catch (error) {
        if (retryLimit < 1 || retryDelay === 0) {
          throw error;
        }

        const response = await mockKyPost(...args);
        return response;
      }
    },
  };
});

jest.mock('ky', () => ({
  __esModule: true,
  default: {
    create: (...args: [Options?]) => mockKyCreate(...args),
  },
}));

jest.mock('@/consts/env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled;
  },
  get ossSurveyEndpoint() {
    return mockOssSurveyEndpoint;
  },
}));

const mockFormData: OssOnboardingFormData = {
  emailAddress: 'Dev@Example.COM',
  newsletter: true,
  project: Project.Company,
  projectName: ' OSS Starter ',
  companyName: 'Acme',
  companySize: CompanySize.Scale3,
};

const getSubmitOssOnboarding = async () => {
  const module = await import('./submit-oss-onboarding');
  return module.submitOssOnboarding;
};

describe('submitOssOnboarding', () => {
  beforeAll(async () => {
    await import('./submit-oss-onboarding');
  });

  afterEach(() => {
    mockKyPost.mockReset();
    mockKyPost.mockResolvedValue({ ok: true });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockKyOptions.current = undefined;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockIsDevFeaturesEnabled = true;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = 'https://survey.example.com';
  });

  beforeEach(() => {
    mockKyPost.mockResolvedValue({ ok: true });
  });

  it('configures the OSS survey client with ky retry options', () => {
    expect(mockKyCreate).toHaveBeenCalledTimes(1);
    expect(mockKyOptions.current?.throwHttpErrors).toBe(false);

    const retry = mockKyOptions.current?.retry;

    expect(retry && typeof retry !== 'number' ? retry.limit : undefined).toBe(1);
    expect(retry && typeof retry !== 'number' ? retry.methods : undefined).toEqual(['post']);
    expect(retry && typeof retry !== 'number' ? retry.statusCodes : undefined).toEqual([]);
    expect(retry && typeof retry !== 'number' ? retry.afterStatusCodes : undefined).toEqual([]);
    expect(retry && typeof retry !== 'number' ? retry.delay?.(1) : undefined).toBe(1);
  });

  it('updates, reports and navigates when onboarding is submitted', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    update.mockResolvedValue();

    await submitOssOnboarding({
      formData: mockFormData,
      navigate,
      update,
    });

    expect(update).toHaveBeenCalledWith({
      questionnaire: {
        emailAddress: 'dev@example.com',
        newsletter: true,
        project: Project.Company,
        projectName: 'OSS Starter',
        companyName: 'Acme',
        companySize: CompanySize.Scale3,
      },
      isOnboardingDone: true,
    });
    expect(mockKyPost).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/surveys'),
      expect.objectContaining({
        json: {
          emailAddress: 'dev@example.com',
          newsletter: true,
          project: Project.Company,
          projectName: 'OSS Starter',
          companyName: 'Acme',
          companySize: CompanySize.Scale3,
        },
        keepalive: true,
      })
    );
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('omits empty company fields in persisted and reported payload', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();
    const formData: OssOnboardingFormData = {
      ...mockFormData,
      companyName: '   ',
      companySize: undefined,
    };

    update.mockResolvedValue();

    await submitOssOnboarding({
      formData,
      navigate,
      update,
    });

    expect(update).toHaveBeenCalledWith({
      questionnaire: {
        emailAddress: 'dev@example.com',
        newsletter: true,
        project: Project.Company,
      },
      isOnboardingDone: true,
    });
    expect(mockKyPost).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/surveys'),
      expect.objectContaining({
        json: {
          emailAddress: 'dev@example.com',
          newsletter: true,
          project: Project.Company,
        },
        keepalive: true,
      })
    );
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('constructs the reporting URL when endpoint has trailing slash', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = 'https://survey.example.com/';
    update.mockResolvedValue();

    await submitOssOnboarding({
      formData: mockFormData,
      navigate,
      update,
    });

    expect(mockKyPost).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/surveys'),
      expect.anything()
    );
  });

  it('still reports and navigates when onboarding data persistence fails', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    update.mockRejectedValue(new Error('save failed'));

    await expect(
      submitOssOnboarding({
        formData: mockFormData,
        navigate,
        update,
      })
    ).resolves.toBeUndefined();

    expect(mockKyPost).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('retries report once after a network failure', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    mockKyPost.mockRejectedValueOnce(new TypeError('network error')).mockResolvedValueOnce({
      ok: true,
    });
    update.mockResolvedValue();

    await expect(
      submitOssOnboarding({
        formData: mockFormData,
        navigate,
        update,
      })
    ).resolves.toBeUndefined();

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(mockKyPost).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('swallows report fetch failures after retry to keep submit flow unchanged', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    mockKyPost.mockRejectedValue(new TypeError('network error'));
    update.mockResolvedValue();

    await expect(
      submitOssOnboarding({
        formData: mockFormData,
        navigate,
        update,
      })
    ).resolves.toBeUndefined();

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(mockKyPost).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('does not report when isDevFeaturesEnabled is false', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockIsDevFeaturesEnabled = false;
    update.mockResolvedValue();

    await submitOssOnboarding({
      formData: mockFormData,
      navigate,
      update,
    });

    expect(mockKyPost).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('does not report when ossSurveyEndpoint is undefined', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = undefined;
    update.mockResolvedValue();

    await submitOssOnboarding({
      formData: mockFormData,
      navigate,
      update,
    });

    expect(mockKyPost).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('does not report when ossSurveyEndpoint is invalid', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = 'not a valid URL';
    update.mockResolvedValue();

    await submitOssOnboarding({
      formData: mockFormData,
      navigate,
      update,
    });

    expect(mockKyPost).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('omits whitespace-only project name before update and report', async () => {
    const submitOssOnboarding = await getSubmitOssOnboarding();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    update.mockResolvedValue();

    await submitOssOnboarding({
      formData: {
        ...mockFormData,
        projectName: '   ',
      },
      navigate,
      update,
    });

    expect(update).toHaveBeenCalledWith({
      questionnaire: {
        emailAddress: 'dev@example.com',
        newsletter: true,
        project: Project.Company,
        companyName: 'Acme',
        companySize: CompanySize.Scale3,
      },
      isOnboardingDone: true,
    });
    expect(mockKyPost).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/surveys'),
      expect.objectContaining({
        json: {
          emailAddress: 'dev@example.com',
          newsletter: true,
          project: Project.Company,
          companyName: 'Acme',
          companySize: CompanySize.Scale3,
        },
        keepalive: true,
      })
    );
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });
});
