import { type CompanySize, Project, type JsonObject } from '@logto/schemas';

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
): JsonObject & Partial<OssOnboardingFormData> => {
  if (!shouldRequireCompanyFields(data.project)) {
    const { companyName: _companyName, companySize: _companySize, ...rest } = data;

    return rest;
  }

  return data;
};
