import { Theme } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import CongratsDark from '@/assets/images/congrats-dark.svg';
import Congrats from '@/assets/images/congrats.svg';
import { envTagsFeatureLink, pricingLink } from '@/consts';
import { LinkButton } from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

function DevelopmentTenantNotification() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const Image = theme === Theme.Light ? Congrats : CongratsDark;
  const { getDocumentationUrl } = useDocumentationUrl();

  return (
    <div className={styles.container}>
      <Image className={styles.image} />
      <div className={styles.content}>
        <div className={styles.title}>
          <Trans
            components={{
              a: (
                <TextLink
                  href={pricingLink}
                  target="_blank"
                  rel="noopener"
                  className={styles.link}
                />
              ),
            }}
          >
            {t('tenants.dev_tenant_notification.title')}
          </Trans>
        </div>
        <div className={styles.description}>
          <DynamicT forKey="tenants.dev_tenant_notification.description" />
        </div>
      </div>
      <LinkButton
        targetBlank
        title="general.learn_more"
        type="outline"
        size="large"
        href={getDocumentationUrl(envTagsFeatureLink)}
      />
    </div>
  );
}

export default DevelopmentTenantNotification;
