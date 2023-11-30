import { isLanguageTag } from '@logto/language-kit';
import { type SsoProviderName } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import { type ParsedSsoIdentityProviderConfig } from '@/pages/EnterpriseSso/types.js';

import * as styles from './index.module.scss';

type Props = {
  identityProviderConfig: ParsedSsoIdentityProviderConfig<SsoProviderName.SAML>['identityProvider'];
};

function ParsedConfigPreview({ identityProviderConfig }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.enterprise_sso_details.saml_preview',
  });
  const { language } = i18next;

  if (!identityProviderConfig) {
    return null;
  }

  const { entityId, signInEndpoint, x509Certificate, expiresAt, isValid } = identityProviderConfig;
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
        <div className={styles.content}>
          <div className={classNames(styles.indicator, !isValid && styles.errorStatus)} />
          <DynamicT
            forKey="enterprise_sso_details.saml_preview.certificate_content"
            interpolation={{
              date: new Date(expiresAt).toLocaleDateString(
                // TODO: check if Logto's language tags are compatible.
                conditional(isLanguageTag(language) && language) ?? 'en',
                {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }
              ),
            }}
          />
          <CopyToClipboard
            className={styles.copyToClipboard}
            variant="icon"
            value={x509Certificate}
          />
        </div>
      </div>
    </div>
  );
}

export default ParsedConfigPreview;
