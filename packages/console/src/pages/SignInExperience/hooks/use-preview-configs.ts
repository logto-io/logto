import type { SignInExperience } from '@logto/schemas';
import { useEffect, useState, useMemo } from 'react';

import useDebounce from '@/hooks/use-debounce';

import { sieFormDataParser } from '../PageContent/utils/parser';
import type { SignInExperienceForm } from '../types';

const usePreviewConfigs = (
  formData: SignInExperienceForm,
  isDirty: boolean,
  data?: SignInExperience,
  timeDelay = 400 // Render the preview after the user stops typing in the custom CSS editing box for two seconds.
) => {
  const debounce = useDebounce(timeDelay);
  const { customCss, ...restFormData } = formData;
  const [debouncedCustomCss, setDebouncedCustomCss] = useState(customCss);

  useEffect(() => {
    debounce(() => {
      setDebouncedCustomCss(customCss);
    });
  }, [debounce, customCss]);

  return useMemo(() => {
    if (!isDirty) {
      return data;
    }

    return sieFormDataParser.toSignInExperience({
      ...restFormData,
      customCss: debouncedCustomCss,
    });
  }, [restFormData, debouncedCustomCss, isDirty, data]);
};

export default usePreviewConfigs;
