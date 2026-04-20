import ky from 'ky';
import { useMemo } from 'react';

import { ossSurveyEndpoint } from '@/consts/env';

import { createOssSurveyReporter } from './utils';

const useReportOssSurvey = () => {
  return useMemo(() => createOssSurveyReporter(ky, ossSurveyEndpoint), []);
};

export default useReportOssSurvey;
