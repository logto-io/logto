import { CompanySize, Project, type OssSurveyReportPayload } from '@logto/schemas';

import {
  getBaseOssOnboardingPayload,
  getOssOnboardingDefaultValues,
  getOssOnboardingSurveyPayload,
  isValidOssOnboardingEmailAddress,
  normalizeOssOnboardingEmailAddress,
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
      companySize: CompanySize.Scale3,
    });
  });

  test('requires company-only fields only for company projects', () => {
    expect(shouldRequireCompanyFields(Project.Company)).toBe(true);
    expect(shouldRequireCompanyFields(Project.Personal)).toBe(false);
  });

  test('normalizes and validates OSS onboarding email addresses', () => {
    expect(normalizeOssOnboardingEmailAddress(' Dev@Example.COM ')).toBe('dev@example.com');
    expect(normalizeOssOnboardingEmailAddress('not-an-email')).toBeUndefined();
    expect(normalizeOssOnboardingEmailAddress('')).toBeUndefined();

    expect(isValidOssOnboardingEmailAddress('Dev@Example.COM')).toBe(true);
    expect(isValidOssOnboardingEmailAddress('not-an-email')).toBe(false);
    expect(isValidOssOnboardingEmailAddress('')).toBe(false);
  });

  test('drops company-only values from the questionnaire payload for personal projects', () => {
    const payload = getBaseOssOnboardingPayload({
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
    });
  });

  test('handles missing company fields for personal project payloads', () => {
    const payload = getBaseOssOnboardingPayload({
      emailAddress: 'Dev@Example.COM',
      newsletter: true,
      project: Project.Personal,
      projectName: '  My starter app  ',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Personal,
      projectName: 'My starter app',
    });
  });

  test('handles missing project name in the questionnaire payload', () => {
    const payload = getBaseOssOnboardingPayload({
      emailAddress: 'Dev@Example.COM',
      newsletter: true,
      project: Project.Personal,
      companyName: 'Should be ignored',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Personal,
    });
  });

  test('omits email-related fields from the questionnaire payload when email is missing', () => {
    const payload = getBaseOssOnboardingPayload({
      emailAddress: '',
      newsletter: true,
      project: Project.Company,
      projectName: '  OSS Portal  ',
      companyName: '  Acme  ',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      project: Project.Company,
      projectName: 'OSS Portal',
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });
  });

  test('keeps company-only values in the questionnaire payload for company projects', () => {
    const payload = getBaseOssOnboardingPayload({
      emailAddress: 'Dev@Example.COM',
      newsletter: false,
      project: Project.Company,
      projectName: '  OSS Portal  ',
      companyName: '  Acme  ',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: false,
      project: Project.Company,
      projectName: 'OSS Portal',
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });
  });

  test('builds a survey payload only when the email address is valid', () => {
    expect(
      getOssOnboardingSurveyPayload({
        emailAddress: '',
        newsletter: true,
        project: Project.Personal,
        projectName: '',
        companyName: '',
        companySize: undefined,
      })
    ).toBeUndefined();

    expect(
      getOssOnboardingSurveyPayload({
        emailAddress: 'Dev@Example.COM',
        newsletter: false,
        project: Project.Personal,
        projectName: '  My starter app  ',
        companyName: 'Should be ignored',
        companySize: CompanySize.Scale3,
      })
    ).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: false,
      project: Project.Personal,
      projectName: 'My starter app',
    } satisfies OssSurveyReportPayload);
  });

  test('handles missing company fields for personal survey payloads', () => {
    const payload = getOssOnboardingSurveyPayload({
      emailAddress: 'Dev@Example.COM',
      newsletter: false,
      project: Project.Personal,
      projectName: '  My starter app  ',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: false,
      project: Project.Personal,
      projectName: 'My starter app',
    } satisfies OssSurveyReportPayload);
  });

  test('handles missing project name in survey payloads', () => {
    const payload = getOssOnboardingSurveyPayload({
      emailAddress: 'Dev@Example.COM',
      newsletter: false,
      project: Project.Personal,
      companyName: 'Should be ignored',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: false,
      project: Project.Personal,
    } satisfies OssSurveyReportPayload);
  });

  test('omits project name when input contains only whitespace', () => {
    const payload = getBaseOssOnboardingPayload({
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
    });
  });

  test('omits company name when input contains only whitespace', () => {
    const payload = getBaseOssOnboardingPayload({
      emailAddress: 'Dev@Example.COM',
      newsletter: true,
      project: Project.Company,
      projectName: ' OSS Portal ',
      companyName: '   ',
      companySize: CompanySize.Scale3,
    });

    expect(payload).toEqual({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Company,
      projectName: 'OSS Portal',
      companySize: CompanySize.Scale3,
    });
  });
});
