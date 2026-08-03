import { Theme } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import DynamicAppDarkIcon from '@/assets/icons/dynamic-app-dark.svg?react';
import DynamicAppIcon from '@/assets/icons/dynamic-app.svg?react';
import useTheme from '@/hooks/use-theme';

import ItemPreview from '.';
import styles from './index.module.scss';

/**
 * The dynamic app (CIMD) row in the third-party application list. It is a tenant-level feature
 * rather than an application, so there is no id to copy and no details page to link to yet.
 */
function DynamicAppPreview() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const Icon = theme === Theme.Light ? DynamicAppIcon : DynamicAppDarkIcon;

  return (
    <ItemPreview
      title={t('applications.dynamic_app.title')}
      subtitle={t('applications.dynamic_app.subtitle')}
      icon={<Icon className={styles.icon} />}
    />
  );
}

export default DynamicAppPreview;
