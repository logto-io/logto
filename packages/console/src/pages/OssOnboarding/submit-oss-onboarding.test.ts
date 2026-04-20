import {
  CompanySize,
  Project,
  type OssSurveyReportPayload,
  type OssUserOnboardingData,
} from '@logto/schemas';

import { submitOssOnboarding } from './submit-oss-onboarding';
import type { OssOnboardingFormData } from './utils';

const mockFormData: OssOnboardingFormData = {
  emailAddress: 'Dev@Example.COM',
  newsletter: true,
  project: Project.Company,
  companyName: 'Acme',
  companySize: CompanySize.Scale3,
};

describe('submitOssOnboarding', () => {
  it('reports the survey payload independently when onboarding is submitted', async () => {
    const report = jest.fn<void, [OssSurveyReportPayload]>();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    update.mockResolvedValue();

    await submitOssOnboarding({
      formData: mockFormData,
      navigate,
      report,
      update,
    });

    expect(report).toHaveBeenCalledWith({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
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
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });

  it('still reports the survey payload when onboarding data persistence fails', async () => {
    const report = jest.fn<void, [OssSurveyReportPayload]>();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    update.mockRejectedValue(new Error('save failed'));

    await expect(
      submitOssOnboarding({
        formData: mockFormData,
        navigate,
        report,
        update,
      })
    ).rejects.toThrow('save failed');

    expect(report).toHaveBeenCalledWith({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('ignores report errors to keep the submit flow behavior unchanged', async () => {
    const report = jest.fn<void, [OssSurveyReportPayload]>();
    const update = jest.fn<Promise<void>, [Partial<OssUserOnboardingData>]>();
    const navigate = jest.fn<void, [string, { replace: boolean }]>();

    report.mockImplementation(() => {
      throw new Error('report failed');
    });
    update.mockResolvedValue();

    await expect(
      submitOssOnboarding({
        formData: mockFormData,
        navigate,
        report,
        update,
      })
    ).resolves.toBeUndefined();

    expect(report).toHaveBeenCalledWith({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });
    expect(navigate).toHaveBeenCalledWith('/get-started', { replace: true });
  });
});
