import { isLanguageTag } from '@logto/language-kit';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import { type SamlProviderConfig } from '@/pages/EnterpriseSsoDetails/types/saml';

import * as styles from './index.module.scss';

type Props = {
  readonly identityProviderConfig: SamlProviderConfig['identityProvider'];
};

type CertificatePreviewProps = {
  readonly identityProviderConfig: {
    x509Certificate: string;
    certificateExpiresAt: number;
    isCertificateValid: boolean;
  };
  readonly className?: string;
};

export function CertificatePreview({
  identityProviderConfig: { x509Certificate, certificateExpiresAt, isCertificateValid },
  className,
}: CertificatePreviewProps) {
  const { language } = i18next;
  return (
    <div className={classNames(styles.certificatePreview, className)}>
      <div className={classNames(styles.indicator, !isCertificateValid && styles.errorStatus)} />
      <DynamicT
        forKey="enterprise_sso_details.saml_preview.certificate_content"
        interpolation={{
          date: new Date(certificateExpiresAt).toLocaleDateString(
            // TODO: @darcyYe check whether can use date-fns later, may need a Logto locale to date-fns locale mapping.
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
      <CopyToClipboard displayType="block" variant="icon" value={x509Certificate} />
    </div>
  );
}

function ParsedConfigPreview({ identityProviderConfig }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.enterprise_sso_details.saml_preview',
  });

  if (!identityProviderConfig) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.title}>{t('sign_on_url')}</div>
        <div className={styles.content}>{identityProviderConfig.signInEndpoint}</div>
      </div>
      <div>
        <div className={styles.title}>{t('entity_id')}</div>
        <div className={styles.content}>{identityProviderConfig.entityId}</div>
      </div>
      <div>
        <div className={styles.title}>{t('x509_certificate')}</div>
        <div className={styles.content}>
          <CertificatePreview identityProviderConfig={identityProviderConfig} />
        </div>
      </div>
    </div>
  );
}

export default ParsedConfigPreview;
