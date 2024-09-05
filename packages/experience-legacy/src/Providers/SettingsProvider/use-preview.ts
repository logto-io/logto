import { ConnectorPlatform } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import initI18n from '@/i18n/init';
import { changeLanguage } from '@/i18n/utils';
import type { PreviewConfig, SignInExperienceResponse } from '@/types';
import { filterPreviewSocialConnectors } from '@/utils/social-connectors';

const usePreview = () => {
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>();
  const { setTheme, setPlatform, setExperienceSettings } = useContext(PageContext);

  // Fetch the preview config
  useEffect(() => {
    // Listen to the message from the ancestor window
    const previewMessageHandler = async (event: MessageEvent) => {
      // #event.data should be guarded at the provider's side
      if (event.data.sender === 'ac_preview') {
        // eslint-disable-next-line no-restricted-syntax
        const previewConfig = event.data.config as PreviewConfig;

        // Wait for i18n to be initialized
        await initI18n(previewConfig.language);

        setPreviewConfig(previewConfig);
      }
    };

    window.addEventListener('message', previewMessageHandler);

    return () => {
      window.removeEventListener('message', previewMessageHandler);
    };
  }, []);

  // Set Experience settings
  useEffect(() => {
    if (!previewConfig) {
      return;
    }

    const {
      signInExperience: { socialConnectors, ...rest },
      isNative,
    } = previewConfig;

    const experienceSettings: SignInExperienceResponse = {
      ...rest,
      socialConnectors: filterPreviewSocialConnectors(
        isNative ? ConnectorPlatform.Native : ConnectorPlatform.Web,
        socialConnectors
      ),
    };

    setExperienceSettings(experienceSettings);
  }, [previewConfig, setExperienceSettings]);

  // Set Theme
  useEffect(() => {
    if (previewConfig?.mode) {
      setTheme(previewConfig.mode);
    }
  }, [previewConfig?.mode, setTheme]);

  // Set Platform
  useEffect(() => {
    if (previewConfig?.platform) {
      setPlatform(previewConfig.platform);
    }
  }, [previewConfig?.platform, setPlatform]);

  // Set Language
  useEffect(() => {
    if (previewConfig?.language) {
      (async () => {
        await changeLanguage(previewConfig.language);
      })();
    }
  }, [previewConfig?.language]);
};

export default usePreview;
