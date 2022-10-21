import { ConnectorPlatform } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import { useEffect, useState } from 'react';

import * as styles from '@/App.module.scss';
import type { Context } from '@/hooks/use-page-context';
import initI18n from '@/i18n/init';
import { changeLanguage } from '@/i18n/utils';
import type { SignInExperienceSettings, PreviewConfig } from '@/types';
import { parseQueryParameters } from '@/utils';
import { getPrimarySignInMethod, getSecondarySignInMethods } from '@/utils/sign-in-experience';
import { filterPreviewSocialConnectors } from '@/utils/social-connectors';

const usePreview = (context: Context): [boolean, PreviewConfig?] => {
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>();
  const { setTheme, setExperienceSettings, setPlatform } = context;

  const { preview } = parseQueryParameters(window.location.search);
  const isPreview = preview === 'true';

  useEffect(() => {
    if (!isPreview) {
      return;
    }

    // Init i18n
    void initI18n();

    // Block pointer event
    document.body.classList.add(conditionalString(styles.preview));

    const previewMessageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.sender === 'ac_preview') {
        // #event.data should be guarded at the provider's side
        // eslint-disable-next-line no-restricted-syntax
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

    const {
      signInExperience: { signInMethods, socialConnectors, color, ...rest },
      language,
      mode,
      platform,
      isNative,
    } = previewConfig;

    const experienceSettings: SignInExperienceSettings = {
      ...rest,
      color: {
        ...color,
        isDarkModeEnabled: false, // Disable theme mode auto detection on preview
      },
      primarySignInMethod: getPrimarySignInMethod(signInMethods),
      secondarySignInMethods: getSecondarySignInMethods(signInMethods),
      socialConnectors: filterPreviewSocialConnectors(
        isNative ? ConnectorPlatform.Native : ConnectorPlatform.Web,
        socialConnectors
      ),
    };

    (async () => {
      setTheme(mode);

      setPlatform(platform);

      await changeLanguage(language);

      setExperienceSettings(experienceSettings);
    })();
  }, [isPreview, previewConfig, setExperienceSettings, setPlatform, setTheme]);

  return [isPreview, previewConfig];
};

export default usePreview;
