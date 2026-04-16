import type { OssQuestionnaire } from '@logto/schemas';

export const reportOssSurvey = (payload: OssQuestionnaire): void => {
  void (async () => {
    try {
      await fetch('/api/oss-survey/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {}
  })();
};
