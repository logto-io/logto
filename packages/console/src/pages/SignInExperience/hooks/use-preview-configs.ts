import type { SignInExperience } from '@logto/schemas';
import { useCallback, useState, useEffect } from 'react';
import type { FieldNamesMarkedBoolean } from 'react-hook-form';

import useDebounce from '@/hooks/use-debounce';

import type { SignInExperienceForm } from '../types';
import { signInExperienceParser } from '../utils/form';

const usePreviewConfigs = (
  formData: SignInExperienceForm,
  isDirty: boolean,
  dirtyFields: FieldNamesMarkedBoolean<SignInExperienceForm>,
  data?: SignInExperience,
  timeDelay = 2000 // Render the preview after the user stops typing in the custom CSS editing box for two seconds.
) => {
  const debounce = useDebounce(timeDelay);
  const [previewConfigs, setPreviewConfigs] = useState<SignInExperience>();

  const parser = useCallback(() => {
    if (!isDirty) {
      return data;
    }

    return signInExperienceParser.toRemoteModel(formData);
  }, [formData, isDirty, data]);

  useEffect(() => {
    // Should delay the preview update if the user is typing in the custom CSS field.
    if (dirtyFields.customCss) {
      debounce(() => {
        setPreviewConfigs(parser());
      });
    } else {
      setPreviewConfigs(parser());
    }
  }, [formData, isDirty]);

  return previewConfigs;
};

export default usePreviewConfigs;
