import { useTranslation } from 'react-i18next';

import { officialWebsiteContactPageLink } from '@/consts';
import { LinkButton } from '@/ds-components/Button';

import styles from './index.module.scss';

function EnterpriseSso() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <div className={styles.description}>{t('tenants.settings.enterprise_sso_description')}</div>
      <LinkButton title="general.contact_us_action" href={officialWebsiteContactPageLink} />
    </div>
  );
}

export default EnterpriseSso;
