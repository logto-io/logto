import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import InfoIcon from '@/assets/icons/info.svg?react';
import LearnMore from '@/components/LearnMore';
import { logtoOssFeatureSupportLink } from '@/consts/external-links';
import { LinkButton } from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import TextLink from '@/ds-components/TextLink';

import styles from './index.module.scss';
import { getSamlAppLimitBannerContent } from './utils';

type Props = {
  readonly variant: 'inline' | 'footer';
  readonly limit: number;
  readonly className?: string;
};

function SamlAppLimitBanner({ variant, limit, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const content = getSamlAppLimitBannerContent({ variant });
  const description = t(content.descriptionKey, {
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
      {content.secondaryHref ? (
        <div className={styles.actions}>
          <LinkButton
            className={styles.primaryAction}
            size={variant === 'footer' ? 'large' : 'medium'}
            type="primary"
            title={
              <DangerousRaw>{t(content.actionKey, { productName: 'Logto Cloud' })}</DangerousRaw>
            }
            href={content.href}
            targetBlank="noopener"
          />
          <TextLink href={content.secondaryHref} targetBlank="noopener">
            {t(content.secondaryActionKey)}
          </TextLink>
        </div>
      ) : variant === 'inline' ? (
        <TextLink className={styles.inlineAction} href={content.href} targetBlank="noopener">
          {t(content.actionKey)}
        </TextLink>
      ) : (
        <LinkButton
          className={styles.footerAction}
          size="large"
          type="primary"
          title={content.actionKey}
          href={content.href}
          targetBlank="noopener"
        />
      )}
    </div>
  );
}

export default SamlAppLimitBanner;
