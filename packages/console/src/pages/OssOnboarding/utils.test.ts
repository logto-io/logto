import { CompanySize, Project } from '@logto/schemas';

import {
  getOssOnboardingDefaultValues,
  getOssOnboardingSubmitPayload,
  shouldRequireCompanyFields,
  type OssOnboardingFormData,
  type OssSurveyReportPayload,
} from './utils';

describe('OSS onboarding form utils', () => {
  test('uses company project as the default selection and leaves email blank', () => {
    expect(getOssOnboardingDefaultValues()).toEqual({
      emailAddress: '',
      newsletter: false,
      project: Project.Company,
      companyName: '',
      companySize: undefined,
    });
  });

  test('requires company-only fields only for company projects', () => {
    expect(shouldRequireCompanyFields(Project.Company)).toBe(true);
    expect(shouldRequireCompanyFields(Project.Personal)).toBe(false);
  });

  test('drops company-only values from the submit payload for personal projects', () => {
    const payload = getOssOnboardingSubmitPayload({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Personal,
      companyName: 'Should be ignored',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Personal,
    } satisfies OssSurveyReportPayload);
  });

  test('keeps company-only values in the submit payload for company projects', () => {
    const payload = getOssOnboardingSubmitPayload({
      emailAddress: 'dev@example.com',
      newsletter: false,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: false,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    } satisfies OssOnboardingFormData);
  });
});
