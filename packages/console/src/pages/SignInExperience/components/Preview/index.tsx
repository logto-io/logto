import type { LanguageTag } from '@logto/language-kit';
import { languages as uiLanguageNameMapping } from '@logto/language-kit';
import type { ConnectorResponse, ConnectorMetadata, SignInExperience } from '@logto/schemas';
import { ConnectorType, AppearanceMode } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { format } from 'date-fns';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import PhoneInfo from '@/assets/images/phone-info.svg';
import Select from '@/components/Select';
import TabNav, { TabNavItem } from '@/components/TabNav';
import type { RequestError } from '@/hooks/use-api';
import useUiLanguages from '@/hooks/use-ui-languages';

import * as styles from './index.module.scss';

type Props = {
  signInExperience?: SignInExperience;
  className?: string;
};

const Preview = ({ signInExperience, className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [language, setLanguage] = useState<LanguageTag>('en');
  const [mode, setMode] = useState<AppearanceMode>(AppearanceMode.LightMode);
  const [platform, setPlatform] = useState<'desktopWeb' | 'mobile' | 'mobileWeb'>('desktopWeb');
  const { data: allConnectors } = useSWR<ConnectorResponse[], RequestError>('/api/connectors');
  const previewRef = useRef<HTMLIFrameElement>(null);
  const { customPhrases } = useUiLanguages();

  const { languages } = useUiLanguages();

  const modeOptions = useMemo(() => {
    const light = { value: AppearanceMode.LightMode, title: t('sign_in_exp.preview.light') };
    const dark = { value: AppearanceMode.DarkMode, title: t('sign_in_exp.preview.dark') };

    if (!signInExperience?.color.isDarkModeEnabled) {
      return [light];
    }

    return [light, dark];
  }, [signInExperience, t]);

  useEffect(() => {
    if (!modeOptions[0]) {
      return;
    }

    if (!modeOptions.some(({ value }) => value === mode)) {
      setMode(modeOptions[0].value);
    }
  }, [modeOptions, mode]);

  const availableLanguageOptions = useMemo(() => {
    const availableLanguageTags =
      signInExperience && !signInExperience.languageInfo.autoDetect
        ? languages.filter(
            (languageTag) => languageTag === signInExperience.languageInfo.fallbackLanguage
          )
        : languages;

    return availableLanguageTags.map((languageTag) => ({
      value: languageTag,
      title: uiLanguageNameMapping[languageTag],
    }));
  }, [languages, signInExperience]);

  useEffect(() => {
    if (!availableLanguageOptions[0]) {
      return;
    }

    if (!availableLanguageOptions.some(({ value }) => value === language)) {
      setLanguage(availableLanguageOptions[0].value);
    }
  }, [language, availableLanguageOptions]);

  const config = useMemo(() => {
    if (!allConnectors || !signInExperience) {
      return;
    }

    const socialConnectors = signInExperience.socialSignInConnectorTargets.reduce<
      Array<ConnectorMetadata & { id: string }>
    >(
      (previous, connectorTarget) => [
        ...previous,
        ...allConnectors.filter(({ target }) => target === connectorTarget),
      ],
      []
    );

    const hasEmailConnector = allConnectors.some(({ type }) => type === ConnectorType.Email);

    const hasSmsConnector = allConnectors.some(({ type }) => type === ConnectorType.Sms);

    return {
      signInExperience: {
        ...signInExperience,
        socialConnectors,
        forgotPassword: {
          email: hasEmailConnector,
          sms: hasSmsConnector,
        },
      },
      language,
      mode,
      platform: platform === 'desktopWeb' ? 'web' : 'mobile',
      isNative: platform === 'mobile',
    };
  }, [allConnectors, language, mode, platform, signInExperience]);

  const postPreviewMessage = useCallback(() => {
    if (!config || !customPhrases) {
      return;
    }

    previewRef.current?.contentWindow?.postMessage(
      { sender: 'ac_preview', config },
      window.location.origin
    );
  }, [config, customPhrases]);

  useEffect(() => {
    postPreviewMessage();

    const iframe = previewRef.current;

    iframe?.addEventListener('load', postPreviewMessage);

    return () => {
      iframe?.removeEventListener('load', postPreviewMessage);
    };
  }, [postPreviewMessage]);

  return (
    <div className={classNames(styles.preview, className)}>
      <div className={styles.header}>
        <div className={styles.title}>{t('sign_in_exp.preview.title')}</div>
        <div className={styles.selects}>
          <Select
            size="small"
            value={language}
            options={availableLanguageOptions}
            onChange={(value) => {
              if (value) {
                setLanguage(value);
              }
            }}
          />
          <Select
            size="small"
            value={mode}
            options={modeOptions}
            onChange={(value) => {
              if (value) {
                setMode(value);
              }
            }}
          />
        </div>
      </div>
      <TabNav className={styles.nav}>
        <TabNavItem
          isActive={platform === 'desktopWeb'}
          onClick={() => {
            setPlatform('desktopWeb');
          }}
        >
          {t('sign_in_exp.preview.desktop_web')}
        </TabNavItem>
        <TabNavItem
          isActive={platform === 'mobileWeb'}
          onClick={() => {
            setPlatform('mobileWeb');
          }}
        >
          {t('sign_in_exp.preview.mobile_web')}
        </TabNavItem>
        <TabNavItem
          isActive={platform === 'mobile'}
          onClick={() => {
            setPlatform('mobile');
          }}
        >
          {t('sign_in_exp.preview.native')}
        </TabNavItem>
      </TabNav>
      <div
        className={classNames(styles.body, platform === 'desktopWeb' ? styles.web : styles.mobile)}
        style={conditional(
          platform === 'desktopWeb' && {
            // Set background color to match iframe's background color on both dark and light mode.
            backgroundColor: mode === AppearanceMode.DarkMode ? '#000' : '#e5e1ec',
          }
        )}
      >
        <div className={styles.deviceWrapper}>
          <div className={classNames(styles.device, styles[mode])}>
            {platform !== 'desktopWeb' && (
              <div className={styles.topBar}>
                <div className={styles.time}>{format(Date.now(), 'HH:mm')}</div>
                <PhoneInfo />
              </div>
            )}
            <iframe
              ref={previewRef}
              // Allow all sandbox rules
              sandbox={undefined}
              src="/sign-in?preview=true"
              tabIndex={-1}
              title={t('sign_in_exp.preview.title')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
