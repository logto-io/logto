import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { type OidcProviderConfig } from '@/pages/EnterpriseSsoDetails/types/oidc';

import styles from './index.module.scss';

type Props = {
  readonly providerConfig: OidcProviderConfig;
  readonly className?: string;
};

function ParsedConfigPreview({ providerConfig, className }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.enterprise_sso_details.oidc_preview',
  });
  const { authorizationEndpoint, tokenEndpoint, userinfoEndpoint, jwksUri, issuer } =
    providerConfig;
  return (
    <div className={classNames(styles.container, className)}>
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
