import { CompanySize, Project, type OssSurveyReportPayload } from '@logto/schemas';

import {
  getOssOnboardingDefaultValues,
  getOssOnboardingSubmitPayload,
  shouldRequireCompanyFields,
} from './utils';

describe('OSS onboarding form utils', () => {
  test('uses company project as the default selection and leaves email blank', () => {
    expect(getOssOnboardingDefaultValues()).toEqual({
      emailAddress: '',
      newsletter: false,
      project: Project.Company,
      projectName: '',
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
      emailAddress: 'Dev@Example.COM',
      newsletter: true,
      project: Project.Personal,
      projectName: '  My starter app  ',
      companyName: 'Should be ignored',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Personal,
      projectName: 'My starter app',
    } satisfies OssSurveyReportPayload);
  });

  test('keeps company-only values in the submit payload for company projects', () => {
    const payload = getOssOnboardingSubmitPayload({
      emailAddress: 'Dev@Example.COM',
      newsletter: false,
      project: Project.Company,
      projectName: '  OSS Portal ',
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: false,
      project: Project.Company,
      projectName: 'OSS Portal',
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    } satisfies OssSurveyReportPayload);
  });

  test('omits project name when input contains only whitespace', () => {
    const payload = getOssOnboardingSubmitPayload({
      emailAddress: 'Dev@Example.COM',
      newsletter: false,
      project: Project.Personal,
      projectName: '   ',
      companyName: '',
      companySize: undefined,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: false,
      project: Project.Personal,
    } satisfies OssSurveyReportPayload);
  });
});
