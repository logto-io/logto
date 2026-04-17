import type { OssQuestionnaire } from '@logto/schemas';
import type { KyInstance } from 'node_modules/ky/distribution/types/ky';

type RequiredOssSurveyField = 'emailAddress' | 'project';

export type OssSurveyReportPayload = Omit<OssQuestionnaire, RequiredOssSurveyField> & {
  [Key in RequiredOssSurveyField]-?: NonNullable<OssQuestionnaire[Key]>;
};

export const createOssSurveyReporter = (api: Pick<KyInstance, 'post'>) => {
  return (payload: OssSurveyReportPayload): void => {
    void (async () => {
      try {
        await api.post('api/oss-survey/report', {
          keepalive: true,
          json: payload,
          retry: { limit: 0 },
        });
      } catch {}
    })();
  };
};
