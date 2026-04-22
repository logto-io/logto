import { CompanySize, type OssSurveyReportPayload, Project } from '@logto/schemas';

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
  companySize: CompanySize.Scale3,
});

export const shouldRequireCompanyFields = (project: Project) => project === Project.Company;

export const getOssOnboardingSubmitPayload = (
  data: OssOnboardingFormData
): OssSurveyReportPayload => {
  const normalizedEmailAddress = data.emailAddress.toLowerCase();

  if (!shouldRequireCompanyFields(data.project)) {
    const {
      companyName: _companyName,
      companySize: _companySize,
      emailAddress: _emailAddress,
      ...rest
    } = data;

    return {
      ...rest,
      emailAddress: normalizedEmailAddress,
    };
  }

  return {
    ...data,
    emailAddress: normalizedEmailAddress,
  };
};
