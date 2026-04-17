import { useMemo } from 'react';

import useApi from '@/hooks/use-api';

import { createOssSurveyReporter } from './report-oss-survey.utils';

export type { OssSurveyReportPayload } from './report-oss-survey.utils';

const useReportOssSurvey = () => {
  const api = useApi({ hideErrorToast: true });

  return useMemo(() => createOssSurveyReporter(api), [api]);
};

export default useReportOssSurvey;
