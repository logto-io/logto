import type { SignInExperience } from '@logto/schemas';
import { useEffect, useState, useMemo } from 'react';

import useDebounce from '@/hooks/use-debounce';

import type { SignInExperienceForm } from '../types';
import { signInExperienceParser } from '../utils/form';

const usePreviewConfigs = (
  formData: SignInExperienceForm,
  isDirty: boolean,
  data?: SignInExperience,
  timeDelay = 2000 // Render the preview after the user stops typing in the custom CSS editing box for two seconds.
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

    return signInExperienceParser.toRemoteModel({
      ...restFormData,
      customCss: debouncedCustomCss,
    });
  }, [restFormData, debouncedCustomCss, isDirty, data]);
};

export default usePreviewConfigs;
