import { Language } from '@logto/phrases';
import { AppearanceMode } from '@logto/schemas';
import { useMemo } from 'react';

import { SignInExperienceSettingsResponse } from '@/types';
import { parseQueryParameters } from '@/utils';

type PreviewConfig = {
  signInExperience: SignInExperienceSettingsResponse;
  language: Language;
  mode: AppearanceMode;
  platform: 'web' | 'mobile';
};

const usePreview = (): [boolean, PreviewConfig?] => {
  const { preview, config } = parseQueryParameters(window.location.search);

  const previewConfig = useMemo(() => {
    if (!preview || !config) {
      return;
    }

    try {
      const {
        signInExperience: { languageInfo, ...rest },
        language,
        mode,
        platform,
      } = JSON.parse(decodeURIComponent(config)) as PreviewConfig;

      // Overwrite languageInfo
      const settings: SignInExperienceSettingsResponse = {
        ...rest,
        languageInfo: {
          ...languageInfo,
          fixedLanguage: language,
          autoDetect: false,
        },
      };

      return { signInExperience: settings, language, mode, platform };
    } catch {}
  }, [config, preview]);

  return [Boolean(preview), previewConfig];
};

export default usePreview;
