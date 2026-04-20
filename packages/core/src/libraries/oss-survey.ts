import type { OssSurveyReportPayload } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
import ky from 'ky';

import { EnvSet } from '#src/env-set/index.js';

const requestTimeout = 3000;
const userAgent = 'Logto OSS (https://logto.io/)';
const surveyReportPath = '/api/surveys';
const consoleLog = new ConsoleLog(chalk.magenta('oss-survey'));

const getSurveyReportEndpoint = (ossSurveyEndpoint: string) =>
  new URL(surveyReportPath, new URL(ossSurveyEndpoint)).toString();

export const reportOssSurvey = (payload: OssSurveyReportPayload): void => {
  const { ossSurveyEndpoint } = EnvSet.values;

  if (!ossSurveyEndpoint) {
    return;
  }

  const surveyReportEndpoint = getSurveyReportEndpoint(ossSurveyEndpoint);

  void (async () => {
    try {
      const response = await ky.post(surveyReportEndpoint, {
        headers: {
          'content-type': 'application/json',
          'user-agent': userAgent,
        },
        json: payload,
        retry: { limit: 0 },
        timeout: requestTimeout,
      });

      consoleLog.info('OSS survey report sent successfully', `status=${response.status}`);
    } catch (error: unknown) {
      consoleLog.error('Failed to send OSS survey report', error);
    }
  })();
};
