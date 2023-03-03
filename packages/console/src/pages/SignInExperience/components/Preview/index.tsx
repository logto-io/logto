import type { LanguageTag } from '@logto/language-kit';
import { languages as uiLanguageNameMapping } from '@logto/language-kit';
import type { SignInExperience } from '@logto/schemas';
import { AppearanceMode } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LivePreviewButton from '@/components/LivePreviewButton';
import Select from '@/components/Select';
import SignInExperiencePreview from '@/components/SignInExperiencePreview';
import { PreviewPlatform } from '@/components/SignInExperiencePreview/types';
import TabNav, { TabNavItem } from '@/components/TabNav';
import ToggleThemeButton from '@/components/ToggleThemeButton';
import useUiLanguages from '@/hooks/use-ui-languages';

import * as styles from './index.module.scss';

type Props = {
  isLivePreviewDisabled?: boolean;
  isLivePreviewEntryInvisible?: boolean;
  signInExperience?: SignInExperience;
  className?: string;
};

const Preview = ({
  isLivePreviewDisabled = false,
  isLivePreviewEntryInvisible = false,
  signInExperience,
  className,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [language, setLanguage] = useState<LanguageTag>('en');
  const [mode, setMode] = useState<Omit<AppearanceMode, AppearanceMode.SyncWithSystem>>(
    AppearanceMode.LightMode
  );
  const [platform, setPlatform] = useState<PreviewPlatform>(PreviewPlatform.DesktopWeb);
  const { languages } = useUiLanguages();

  useEffect(() => {
    if (!signInExperience?.color.isDarkModeEnabled) {
      setMode(AppearanceMode.LightMode);
    }
  }, [mode, signInExperience]);

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

  return (
    <div className={classNames(styles.preview, className)}>
      <div className={styles.header}>
        <div className={styles.title}>{t('sign_in_exp.preview.title')}</div>
        <div className={styles.selects}>
          {signInExperience?.color.isDarkModeEnabled && (
            <ToggleThemeButton value={mode} size="small" onToggle={setMode} />
          )}
          <Select
            className={styles.language}
            size="small"
            value={language}
            options={availableLanguageOptions}
            onChange={(value) => {
              if (value) {
                setLanguage(value);
              }
            }}
          />
          {!isLivePreviewEntryInvisible && (
            <LivePreviewButton isDisabled={isLivePreviewDisabled} size="small" />
          )}
        </div>
      </div>
      <TabNav className={styles.nav}>
        <TabNavItem
          isActive={platform === PreviewPlatform.DesktopWeb}
          onClick={() => {
            setPlatform(PreviewPlatform.DesktopWeb);
          }}
        >
          {t('sign_in_exp.preview.desktop_web')}
        </TabNavItem>
        <TabNavItem
          isActive={platform === PreviewPlatform.MobileWeb}
          onClick={() => {
            setPlatform(PreviewPlatform.MobileWeb);
          }}
        >
          {t('sign_in_exp.preview.mobile_web')}
        </TabNavItem>
        <TabNavItem
          isActive={platform === PreviewPlatform.Mobile}
          onClick={() => {
            setPlatform(PreviewPlatform.Mobile);
          }}
        >
          {t('sign_in_exp.preview.native')}
        </TabNavItem>
      </TabNav>
      <SignInExperiencePreview
        platform={platform}
        mode={mode}
        language={language}
        signInExperience={signInExperience}
      />
    </div>
  );
};

export default Preview;
