import { type SsoProviderName } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import { type ParsedSsoIdentityProviderConfig } from '@/pages/EnterpriseSso/types.js';

import * as styles from './index.module.scss';

type Props = {
  identityProviderConfig: ParsedSsoIdentityProviderConfig<SsoProviderName.SAML>['identityProvider'];
};

function ParsedConfigPreview({ identityProviderConfig }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.enterprise_sso_details.saml_preview',
  });

  if (!identityProviderConfig) {
    return null;
  }

  const { entityId, signInEndpoint, x509Certificate } = identityProviderConfig;
  return (
    <div className={styles.container}>
      <div>
        <div className={styles.title}>{t('sign_on_url')}</div>
        <div className={styles.content}>{signInEndpoint}</div>
      </div>
      <div>
        <div className={styles.title}>{t('entity_id')}</div>
        <div className={styles.content}>{entityId}</div>
      </div>
      <div>
        <div className={styles.title}>{t('x509_certificate')}</div>
        <div className={styles.content}>{x509Certificate}</div>
      </div>
    </div>
  );
}

export default ParsedConfigPreview;
