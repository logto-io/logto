import type { OssQuestionnaire } from '@logto/schemas';

type RequiredOssSurveyField = 'emailAddress' | 'project';

export type OssSurveyReportPayload = Omit<OssQuestionnaire, RequiredOssSurveyField> & {
  [Key in RequiredOssSurveyField]-?: NonNullable<OssQuestionnaire[Key]>;
};

export const reportOssSurvey = (payload: OssSurveyReportPayload): void => {
  void (async () => {
    try {
      await fetch('/api/oss-survey/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
        body: JSON.stringify(payload),
      });
    } catch {}
  })();
};
