// FIXME: @sijie
/* eslint-disable react/iframe-missing-sandbox */
import { languageOptions } from '@logto/phrases-ui';
import { AppearanceMode, ConnectorDto, ConnectorMetadata, SignInExperience } from '@logto/schemas';
import type { LanguageKey } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Card from '@/components/Card';
import Select from '@/components/Select';
import TabNav, { TabNavItem } from '@/components/TabNav';
import { RequestError } from '@/hooks/use-api';
import PhoneInfo from '@/icons/PhoneInfo';

import * as styles from './Preview.module.scss';

type Props = {
  signInExperience?: SignInExperience;
  className?: string;
};

const Preview = ({ signInExperience, className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [language, setLanguage] = useState<LanguageKey>('en');
  const [mode, setMode] = useState<AppearanceMode>(AppearanceMode.LightMode);
  const [platform, setPlatform] = useState<'desktopWeb' | 'mobile' | 'mobileWeb'>('desktopWeb');
  const { data: allConnectors } = useSWR<ConnectorDto[], RequestError>('/api/connectors');
  const previewRef = useRef<HTMLIFrameElement>(null);

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
    if (signInExperience && !signInExperience.languageInfo.autoDetect) {
      return languageOptions.filter(
        ({ value }) => value === signInExperience.languageInfo.fixedLanguage
      );
    }

    return languageOptions;
  }, [signInExperience]);

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
        ...allConnectors.filter(({ target, enabled }) => target === connectorTarget && enabled),
      ],
      []
    );

    return {
      signInExperience: {
        ...signInExperience,
        socialConnectors,
      },
      language,
      mode,
      platform: platform === 'desktopWeb' ? 'web' : 'mobile',
      isNative: platform === 'mobile',
    };
  }, [allConnectors, language, mode, platform, signInExperience]);

  const postPreviewMessage = useCallback(() => {
    if (!config) {
      return;
    }

    previewRef.current?.contentWindow?.postMessage(
      { sender: 'ac_preview', config },
      window.location.origin
    );
  }, [config]);

  useEffect(() => {
    postPreviewMessage();

    const iframe = previewRef.current;

    iframe?.addEventListener('load', postPreviewMessage);

    return () => {
      iframe?.removeEventListener('load', postPreviewMessage);
    };
  }, [postPreviewMessage]);

  return (
    <Card className={classNames(styles.preview, className)}>
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
            backgroundColor: mode === AppearanceMode.DarkMode ? '#2A2C31' : '#e5e1ec',
          }
        )}
      >
        <div className={styles.deviceWrapper}>
          <div className={classNames(styles.device, styles[mode])}>
            {platform !== 'desktopWeb' && (
              <div className={styles.topBar}>
                <div className={styles.time}>{dayjs().format('HH:mm')}</div>
                <PhoneInfo />
              </div>
            )}
            <iframe ref={previewRef} src="/sign-in?preview=true" tabIndex={-1} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Preview;
/* eslint-enable react/iframe-missing-sandbox */
