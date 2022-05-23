import { Language } from '@logto/phrases';
import { AppearanceMode } from '@logto/schemas';
import i18next from 'i18next';
import { useEffect, useMemo, useState } from 'react';

import { Context } from '@/hooks/use-page-context';
import initI18n from '@/i18n/init';
import { SignInExperienceSettingsResponse } from '@/types';
import { parseQueryParameters } from '@/utils';
import { parseSignInExperienceSettings } from '@/utils/sign-in-experience';

type PreviewConfig = {
  signInExperience: SignInExperienceSettingsResponse;
  language: Language;
  mode: AppearanceMode.LightMode | AppearanceMode.DarkMode;
  platform: 'web' | 'mobile';
};

const usePreview = (context: Context): [boolean, PreviewConfig?] => {
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>();
  const { setTheme, setExperienceSettings, setPlatform } = context;

  const { preview } = parseQueryParameters(window.location.search);
  const isPreview = useMemo(() => preview === 'true', [preview]);

  useEffect(() => {
    // Init i18n
    void initI18n();

    // Post page ready message to the parent window
    window.parent.postMessage({ pageReady: true, sender: 'logto_ui' }, window.location.origin);
  }, []);

  useEffect(() => {
    if (!isPreview) {
      return;
    }

    const previewMessageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.sender === 'ac_preview') {
        setPreviewConfig(event.data.config as PreviewConfig);
      }
    };

    window.addEventListener('message', previewMessageHandler);

    return () => {
      window.removeEventListener('message', previewMessageHandler);
    };
  }, [isPreview]);

  useEffect(() => {
    if (!isPreview || !previewConfig) {
      return;
    }

    const { signInExperience, language, mode, platform } = previewConfig;
    const experienceSettings = parseSignInExperienceSettings(signInExperience);

    void i18next.changeLanguage(language);

    setTheme(mode);
    setPlatform(platform);
    setExperienceSettings({
      ...experienceSettings,
      branding: {
        ...experienceSettings.branding,
        isDarkModeEnabled: false, // Disable theme mode auto detection on preview
      },
    });
  }, [isPreview, previewConfig, setExperienceSettings, setPlatform, setTheme]);

  return [isPreview, previewConfig];
};

export default usePreview;
