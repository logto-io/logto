import { type CompanySize, type OssSurveyReportPayload, Project } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import type { KyInstance } from 'node_modules/ky/distribution/types/ky';

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

export const createOssSurveyReporter = (api: Pick<KyInstance, 'post'>) => {
  return (payload: OssSurveyReportPayload): void => {
    void trySafe(async () =>
        await api.post('api/oss-survey/report', {
          keepalive: true,
          json: payload,
          retry: { limit: 0 },
        })
    );
  };
};

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
