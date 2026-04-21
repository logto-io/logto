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
  const projectNamePayload = normalizedProjectName ? { projectName: normalizedProjectName } : {};

  if (!shouldRequireCompanyFields(data.project)) {
    const {
      projectName: _projectName,
      companyName: _companyName,
      companySize: _companySize,
      emailAddress: _emailAddress,
      ...rest
    } = data;

    return {
      ...rest,
      emailAddress: normalizedEmailAddress,
      ...projectNamePayload,
    };
  }

  const { projectName: _projectName, ...rest } = data;

  return {
    ...rest,
    emailAddress: normalizedEmailAddress,
    ...projectNamePayload,
  };
};
