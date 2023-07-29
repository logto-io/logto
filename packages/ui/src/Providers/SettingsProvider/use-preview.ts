import { ConnectorPlatform } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import initI18n from '@/i18n/init';
import { changeLanguage } from '@/i18n/utils';
import type { PreviewConfig, SignInExperienceResponse } from '@/types';
import { filterPreviewBlockchainConnectors } from '@/utils/connectors/blockchain-connectors';
import { filterPreviewSocialConnectors } from '@/utils/connectors/social-connectors';

const usePreview = () => {
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>();
  const { setTheme, setPlatform, setExperienceSettings } = useContext(PageContext);

  // Fetch the preview config
  useEffect(() => {
    // Init i18n
    const i18nInit = initI18n();

    // Listen to the message from the ancestor window
    const previewMessageHandler = async (event: MessageEvent) => {
      // #event.data should be guarded at the provider's side
      if (event.data.sender === 'ac_preview') {
        // Wait for i18n to be initialized
        await i18nInit;

        // eslint-disable-next-line no-restricted-syntax
        setPreviewConfig(event.data.config as PreviewConfig);
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
      signInExperience: { socialConnectors, blockchainConnectors, ...rest },
      isNative,
    } = previewConfig;

    const experienceSettings: SignInExperienceResponse = {
      ...rest,
      socialConnectors: filterPreviewSocialConnectors(
        isNative ? ConnectorPlatform.Native : ConnectorPlatform.Web,
        socialConnectors
      ),
      blockchainConnectors: filterPreviewBlockchainConnectors(
        isNative ? ConnectorPlatform.Native : ConnectorPlatform.Web,
        blockchainConnectors
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
