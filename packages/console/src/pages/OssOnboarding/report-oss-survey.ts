import { useMemo } from 'react';

import useApi from '@/hooks/use-api';

import { createOssSurveyReporter } from './utils';

const useReportOssSurvey = () => {
  const api = useApi({ hideErrorToast: true });

  return useMemo(() => createOssSurveyReporter(api), [api]);
};

export default useReportOssSurvey;
