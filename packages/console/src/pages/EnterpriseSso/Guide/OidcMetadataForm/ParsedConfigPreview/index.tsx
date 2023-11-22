import { type SsoProviderName } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import { type ParsedSsoIdentityProviderConfig } from '@/pages/EnterpriseSso/types.js';

import * as styles from './index.module.scss';

type Props = {
  providerConfig: ParsedSsoIdentityProviderConfig<SsoProviderName.OIDC>;
};

function ParsedConfigPreview({ providerConfig }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.enterprise_sso_details.oidc_preview',
  });
  const { authorizationEndpoint, tokenEndpoint, userinfoEndpoint, jwksUri, issuer } =
    providerConfig;
  return (
    <div className={styles.container}>
      <div>
        <div className={styles.title}>{t('authorization_endpoint')}</div>
        <div className={styles.content}>{authorizationEndpoint}</div>
      </div>
      <div>
        <div className={styles.title}>{t('token_endpoint')}</div>
        <div className={styles.content}>{tokenEndpoint}</div>
      </div>
      <div>
        <div className={styles.title}>{t('userinfo_endpoint')}</div>
        <div className={styles.content}>{userinfoEndpoint}</div>
      </div>
      <div>
        <div className={styles.title}>{t('jwks_uri')}</div>
        <div className={styles.content}>{jwksUri}</div>
      </div>
      <div>
        <div className={styles.title}>{t('issuer')}</div>
        <div className={styles.content}>{issuer}</div>
      </div>
    </div>
  );
}

export default ParsedConfigPreview;
