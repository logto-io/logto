import type { SignInExperience } from '@logto/schemas';
import { useMemo } from 'react';

import type { SignInExperienceForm } from '../types';
import { signInExperienceParser } from '../utilities';

const usePreviewConfigs = (
  formData: SignInExperienceForm,
  isDirty: boolean,
  data?: SignInExperience
) => {
  return useMemo(() => {
    if (!isDirty) {
      return data;
    }

    return signInExperienceParser.toRemoteModel(formData);
  }, [formData, isDirty, data]);
};

export default usePreviewConfigs;
