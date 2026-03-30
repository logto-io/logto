import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import InfoIcon from '@/assets/icons/info.svg?react';
import LearnMore from '@/components/LearnMore';
import { pricingLink, logtoOssFeatureSupportLink } from '@/consts/external-links';
import { LinkButton } from '@/ds-components/Button';
import TextLink from '@/ds-components/TextLink';

import styles from './index.module.scss';

type Props = {
  readonly variant: 'inline' | 'footer';
  readonly limit: number;
  readonly className?: string;
};

function SamlAppLimitBanner({ variant, limit, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const description = t('upsell.paywall.saml_applications_oss_limit_notice', {
    limit,
    defaultValue: '',
  });

  return (
    <div
      className={classNames(styles.banner, styles[variant], className)}
      data-testid={`saml-app-limit-banner-${variant}`}
    >
      {variant === 'inline' && (
        <div className={styles.icon}>
          <InfoIcon />
        </div>
      )}
      <div className={styles.content}>
        {description}
        <LearnMore href={logtoOssFeatureSupportLink} />
      </div>
      {variant === 'inline' ? (
        <TextLink className={styles.inlineAction} href={pricingLink} targetBlank="noopener">
          {t('upsell.view_plans')}
        </TextLink>
      ) : (
        <LinkButton
          className={styles.footerAction}
          size="large"
          type="primary"
          title="upsell.view_plans"
          href={pricingLink}
          targetBlank="noopener"
        />
      )}
    </div>
  );
}

export default SamlAppLimitBanner;
