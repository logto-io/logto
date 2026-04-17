import { type CompanySize, Project } from '@logto/schemas';

import type { OssSurveyReportPayload } from './report-oss-survey';

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

export const shouldRequireCompanyFields = (project: Project) => project === Project.Company;

export const getOssOnboardingSubmitPayload = (
  data: OssOnboardingFormData
): OssSurveyReportPayload => {
  if (!shouldRequireCompanyFields(data.project)) {
    const { companyName: _companyName, companySize: _companySize, ...rest } = data;

    return rest;
  }

  return data;
};
