import { CompanySize, Project, type OssUserOnboardingData } from '@logto/schemas';

import { submitOssOnboarding } from './submit-oss-onboarding';
import type { OssOnboardingFormData } from './utils';

// Module-level mocks for env constants. Must be declared before importing the module under test.
// eslint-disable-next-line @silverhand/fp/no-let
let mockIsDevFeaturesEnabled = true;
// eslint-disable-next-line @silverhand/fp/no-let
let mockOssSurveyEndpoint: string | undefined = 'https://survey.example.com';

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
  companyName: 'Acme',
  companySize: CompanySize.Scale3,
};

describe('submitOssOnboarding', () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true });

  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockClear();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockIsDevFeaturesEnabled = true;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = 'https://survey.example.com';
  });

  it('updates, reports and navigates when onboarding is submitted', async () => {
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
        companyName: 'Acme',
        companySize: CompanySize.Scale3,
      },
      isOnboardingDone: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/surveys'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailAddress: 'dev@example.com',
          newsletter: true,
          project: Project.Company,
          companyName: 'Acme',
          companySize: CompanySize.Scale3,
        }),
        keepalive: true,
      })
    );
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('constructs the reporting URL when endpoint has trailing slash', async () => {
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

    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/surveys'),
      expect.anything()
    );
  });

  it('still reports and navigates when onboarding data persistence fails', async () => {
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

    expect(fetchMock).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('swallows report fetch failures to keep submit flow unchanged', async () => {
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    fetchMock.mockRejectedValue(new Error('network error'));
    update.mockResolvedValue();

    await expect(
      submitOssOnboarding({
        formData: mockFormData,
        navigate,
        update,
      })
    ).resolves.toBeUndefined();

    // Allow the promise to settle so the rejection is handled
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('does not report when isDevFeaturesEnabled is false', async () => {
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

    expect(fetchMock).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('does not report when ossSurveyEndpoint is undefined', async () => {
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

    expect(fetchMock).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('does not report when ossSurveyEndpoint is invalid', async () => {
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

    expect(fetchMock).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });
});
