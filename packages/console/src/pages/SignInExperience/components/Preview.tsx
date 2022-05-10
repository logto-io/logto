import { Language } from '@logto/phrases';
import { AppearanceMode, SignInExperience } from '@logto/schemas';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/components/Card';
import Select from '@/components/Select';
import TabNav, { TabNavItem } from '@/components/TabNav';

import * as styles from './Preview.module.scss';

type Props = {
  signInExperience: SignInExperience;
};

const Preview = ({ signInExperience }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [language, setLanguage] = useState<Language>(Language.English);
  const [mode, setMode] = useState<AppearanceMode>(AppearanceMode.LightMode);
  const [platform, setPlatform] = useState<'web' | 'mobile'>('web');

  // TODO: is a placeholder
  const config = encodeURIComponent(
    JSON.stringify({
      ...signInExperience,
      language,
      mode,
      platform,
    })
  );

  return (
    <Card className={styles.preview}>
      <div className={styles.header}>
        <div className={styles.title}>{t('sign_in_exp.preview.title')}</div>
        <div className={styles.selects}>
          <Select
            value={language}
            options={[
              { value: Language.English, title: t('sign_in_exp.preview.languages.english') },
              { value: Language.Chinese, title: t('sign_in_exp.preview.languages.chinese') },
            ]}
            onChange={(value) => {
              setLanguage(value as Language);
            }}
          />
          <Select
            value={mode}
            options={[
              { value: AppearanceMode.LightMode, title: t('sign_in_exp.preview.light') },
              { value: AppearanceMode.DarkMode, title: t('sign_in_exp.preview.dark') },
            ]}
            onChange={(value) => {
              setMode(value as AppearanceMode);
            }}
          />
        </div>
      </div>
      <TabNav className={styles.nav}>
        <TabNavItem
          isActive={platform === 'web'}
          onClick={() => {
            setPlatform('web');
          }}
        >
          {t('sign_in_exp.preview.web')}
        </TabNavItem>
        <TabNavItem
          isActive={platform === 'mobile'}
          onClick={() => {
            setPlatform('mobile');
          }}
        >
          {t('sign_in_exp.preview.mobile')}
        </TabNavItem>
      </TabNav>
      <div className={styles.body}>
        <iframe src={`/sign-in?config=${config}`} />
      </div>
    </Card>
  );
};

export default Preview;
