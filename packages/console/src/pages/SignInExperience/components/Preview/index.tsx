import type { LanguageTag } from '@logto/language-kit';
import { languages as uiLanguageNameMapping } from '@logto/language-kit';
import { type SignInExperience, Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LivePreviewButton from '@/components/LivePreviewButton';
import SignInExperiencePreview, { ToggleUiThemeButton } from '@/components/SignInExperiencePreview';
import { PreviewPlatform } from '@/components/SignInExperiencePreview/types';
import Select from '@/ds-components/Select';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useConnectorGroups from '@/hooks/use-connector-groups';
import useUiLanguages from '@/hooks/use-ui-languages';

import * as styles from './index.module.scss';

type Props = {
  readonly isLivePreviewDisabled?: boolean;
  readonly isLivePreviewEntryInvisible?: boolean;
  readonly signInExperience?: SignInExperience;
  readonly className?: string;
};

function Preview({
  isLivePreviewDisabled = false,
  isLivePreviewEntryInvisible = false,
  signInExperience,
  className,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { hasSupportNativePlatformTarget: isNativeTabEnabled } = useConnectorGroups();
  const [language, setLanguage] = useState<LanguageTag>('en');
  const [mode, setMode] = useState<Theme>(Theme.Light);
  const [platform, setPlatform] = useState<PreviewPlatform>(PreviewPlatform.DesktopWeb);
  const { languages } = useUiLanguages();

  useEffect(() => {
    if (!signInExperience?.color.isDarkModeEnabled) {
      setMode(Theme.Light);
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
            <ToggleUiThemeButton value={mode} size="small" onToggle={setMode} />
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
          {t(
            isNativeTabEnabled ? 'sign_in_exp.preview.desktop_web' : 'sign_in_exp.preview.desktop'
          )}
        </TabNavItem>
        <TabNavItem
          isActive={platform === PreviewPlatform.MobileWeb}
          onClick={() => {
            setPlatform(PreviewPlatform.MobileWeb);
          }}
        >
          {t(isNativeTabEnabled ? 'sign_in_exp.preview.mobile_web' : 'sign_in_exp.preview.mobile')}
        </TabNavItem>
        {isNativeTabEnabled && (
          <TabNavItem
            isActive={platform === PreviewPlatform.Mobile}
            onClick={() => {
              setPlatform(PreviewPlatform.Mobile);
            }}
          >
            {t('sign_in_exp.preview.native')}
          </TabNavItem>
        )}
      </TabNav>
      <SignInExperiencePreview
        platform={platform}
        mode={mode}
        language={language}
        signInExperience={signInExperience}
      />
    </div>
  );
}

export default Preview;
