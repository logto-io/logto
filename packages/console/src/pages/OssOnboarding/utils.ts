import { emailRegEx } from '@logto/core-kit';
import { CompanySize, type OssSurveyReportPayload, Project } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

export type OssOnboardingFormData = {
  emailAddress: string;
  newsletter: boolean;
  project: Project;
  projectName: string;
  companyName?: string;
  companySize?: CompanySize;
};

export const getOssOnboardingDefaultValues = (): OssOnboardingFormData => ({
  emailAddress: '',
  newsletter: false,
  project: Project.Company,
  projectName: '',
  companyName: '',
  companySize: CompanySize.Scale3,
});

export const shouldRequireCompanyFields = (project: Project) => project === Project.Company;

export const normalizeOssOnboardingEmailAddress = (emailAddress: string): Optional<string> => {
  const normalizedEmailAddress = emailAddress.trim().toLowerCase();

  if (!normalizedEmailAddress || !emailRegEx.test(normalizedEmailAddress)) {
    return;
  }

  return normalizedEmailAddress;
};

export const isValidOssOnboardingEmailAddress = (emailAddress: string) =>
  Boolean(normalizeOssOnboardingEmailAddress(emailAddress));

export const getBaseOssOnboardingPayload = (data: OssOnboardingFormData) => {
  const normalizedEmailAddress = normalizeOssOnboardingEmailAddress(data.emailAddress);
  const normalizedProjectName = data.projectName.trim();
  const normalizedCompanyName = (data.companyName ?? '').trim();
  const projectNameFields = normalizedProjectName ? { projectName: normalizedProjectName } : {};
  const companyNameFields = normalizedCompanyName ? { companyName: normalizedCompanyName } : {};
  const emailFields = normalizedEmailAddress
    ? {
        emailAddress: normalizedEmailAddress,
        newsletter: data.newsletter,
      }
    : {};

  const basePayload = {
    project: data.project,
    ...projectNameFields,
    ...emailFields,
  };

  if (!shouldRequireCompanyFields(data.project)) {
    return basePayload;
  }

  return {
    ...basePayload,
    ...companyNameFields,
    companySize: data.companySize,
  };
};

export const getOssOnboardingSurveyPayload = (
  data: OssOnboardingFormData
): Optional<OssSurveyReportPayload> => {
  const normalizedEmailAddress = normalizeOssOnboardingEmailAddress(data.emailAddress);
  const normalizedProjectName = data.projectName.trim();
  const normalizedCompanyName = (data.companyName ?? '').trim();
  const projectNameFields = normalizedProjectName ? { projectName: normalizedProjectName } : {};
  const companyNameFields = normalizedCompanyName ? { companyName: normalizedCompanyName } : {};

  if (!normalizedEmailAddress) {
    return;
  }

  if (!shouldRequireCompanyFields(data.project)) {
    return {
      project: data.project,
      ...projectNameFields,
      emailAddress: normalizedEmailAddress,
      newsletter: data.newsletter,
    };
  }

  return {
    project: data.project,
    ...projectNameFields,
    emailAddress: normalizedEmailAddress,
    newsletter: data.newsletter,
    ...companyNameFields,
    companySize: data.companySize,
  };
};
