import { type CompanySize, type OssSurveyReportPayload, Project } from '@logto/schemas';

export type OssOnboardingFormData = {
  emailAddress: string;
  newsletter: boolean;
  project: Project;
  companyName: string;
  companySize?: CompanySize;
};

export const getOssOnboardingDefaultValues = (): OssOnboardingFormData => ({
  emailAddress: '',
  newsletter: false,
  project: Project.Company,
  companyName: '',
  companySize: undefined,
});

export const shouldIncludeCompanyFields = (project: Project) => project === Project.Company;

export const getOssOnboardingSubmitPayload = (
  data: OssOnboardingFormData
): OssSurveyReportPayload => {
  const normalizedEmailAddress = data.emailAddress.toLowerCase();
  const { companyName, companySize, ...rest } = data;

  if (!shouldIncludeCompanyFields(data.project)) {
    return {
      ...rest,
      emailAddress: normalizedEmailAddress,
    };
  }

  const normalizedCompanyName = companyName.trim();

  return {
    ...rest,
    emailAddress: normalizedEmailAddress,
    ...(normalizedCompanyName ? { companyName: normalizedCompanyName } : {}),
    ...(companySize ? { companySize } : {}),
  };
};
