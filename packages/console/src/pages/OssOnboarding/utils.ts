import { emailRegEx } from '@logto/core-kit';
import { CompanySize, type OssSurveyReportPayload, Project } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

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
  const emailFields = normalizedEmailAddress
    ? {
        emailAddress: normalizedEmailAddress,
        newsletter: data.newsletter,
      }
    : {};
  const { emailAddress: _emailAddress, newsletter: _newsletter, ...restWithoutEmail } = data;

  if (!shouldRequireCompanyFields(data.project)) {
    const { companyName: _companyName, companySize: _companySize, ...rest } = restWithoutEmail;

    return {
      ...rest,
      ...emailFields,
    };
  }

  return {
    ...restWithoutEmail,
    ...emailFields,
  };
};

export const getOssOnboardingSurveyPayload = (
  data: OssOnboardingFormData
): Optional<OssSurveyReportPayload> => {
  const normalizedEmailAddress = normalizeOssOnboardingEmailAddress(data.emailAddress);

  if (!normalizedEmailAddress) {
    return;
  }

  if (!shouldRequireCompanyFields(data.project)) {
    return {
      project: data.project,
      emailAddress: normalizedEmailAddress,
      newsletter: data.newsletter,
    };
  }

  return {
    project: data.project,
    emailAddress: normalizedEmailAddress,
    newsletter: data.newsletter,
    companyName: data.companyName,
    companySize: data.companySize,
  };
};
