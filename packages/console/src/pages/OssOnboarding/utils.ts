import { type CompanySize, type OssSurveyReportPayload, Project } from '@logto/schemas';

export type OssOnboardingFormData = {
  emailAddress: string;
  newsletter: boolean;
  project: Project;
  projectName: string;
  companyName: string;
  companySize?: CompanySize;
};

export const getOssOnboardingDefaultValues = (): OssOnboardingFormData => ({
  emailAddress: '',
  newsletter: false,
  project: Project.Company,
  projectName: '',
  companyName: '',
  companySize: undefined,
});

export const shouldRequireCompanyFields = (project: Project) => project === Project.Company;

export const getOssOnboardingSubmitPayload = (
  data: OssOnboardingFormData
): OssSurveyReportPayload => {
  const normalizedEmailAddress = data.emailAddress.toLowerCase();
  const normalizedProjectName = data.projectName.trim();
  const normalizedCompanyName = data.companyName.trim();
  const projectNamePayload = normalizedProjectName ? { projectName: normalizedProjectName } : {};
  const basePayload = {
    emailAddress: normalizedEmailAddress,
    newsletter: data.newsletter,
    project: data.project,
    ...projectNamePayload,
  };

  if (!shouldRequireCompanyFields(data.project)) {
    return basePayload;
  }

  return {
    ...basePayload,
    ...(normalizedCompanyName ? { companyName: normalizedCompanyName } : {}),
    ...(data.companySize ? { companySize: data.companySize } : {}),
  };
};
