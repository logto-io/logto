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

const surveyReportPath = '/api/surveys';

const getSurveyReportEndpoint = (ossSurveyEndpoint: string) =>
  new URL(surveyReportPath, new URL(ossSurveyEndpoint)).toString();

export const createOssSurveyReporter = (
  api: Pick<KyInstance, 'post'>,
  ossSurveyEndpoint?: string
) => {
  const surveyReportEndpoint = trySafe(() =>
    ossSurveyEndpoint ? getSurveyReportEndpoint(ossSurveyEndpoint) : undefined
  );

  return (payload: OssSurveyReportPayload): void => {
    if (!surveyReportEndpoint) {
      return;
    }

    void trySafe(
      api.post(surveyReportEndpoint, {
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
