import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import OrganizationFeatureDark from '@/assets/icons/organization-feature-dark.svg';
import OrganizationFeature from '@/assets/icons/organization-feature.svg';
import PermissionFeatureDark from '@/assets/icons/permission-feature-dark.svg';
import PermissionFeature from '@/assets/icons/permission-feature.svg';
import workflowImage from '@/assets/images/organization-workflow.webp';
import Card from '@/ds-components/Card';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

const icons = {
  [Theme.Light]: { OrganizationIcon: OrganizationFeature, PermissionIcon: PermissionFeature },
  [Theme.Dark]: {
    OrganizationIcon: OrganizationFeatureDark,
    PermissionIcon: PermissionFeatureDark,
  },
};

function Step1() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations.guide' });
  const theme = useTheme();
  const { OrganizationIcon, PermissionIcon } = icons[theme];

  return (
    <div className={classNames(styles.container)}>
      <Card className={styles.card}>
        <OrganizationIcon className={styles.icon} />
        <div className={styles.title}>{t('brief_title')}</div>
        <img className={styles.image} src={workflowImage} alt="Organization workflow" />
        <div className={styles.subtitle}>{t('brief_introduction')}</div>
      </Card>
      <Card className={styles.card}>
        <PermissionIcon className={styles.icon} />
        <div className={styles.title}>{t('step_1')}</div>
      </Card>
    </div>
  );
}

export default Step1;
