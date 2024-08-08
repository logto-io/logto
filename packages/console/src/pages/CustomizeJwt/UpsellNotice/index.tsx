import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import Button from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';

type Props = {
  readonly isVisible: boolean;
  readonly className?: string;
};

function UpsellNotice({ isVisible, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();

  if (!isVisible) {
    return null;
  }

  return (
    <div className={classNames(styles.inlineNotification, styles.info, styles.plain, className)}>
      <div className={styles.content}>
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
          }}
        >
          {t('upsell.paywall.custom_jwt.description')}
        </Trans>
      </div>
      <div className={styles.action}>
        <Button
          title="upsell.upgrade_plan"
          type="primary"
          size="medium"
          onClick={() => {
            navigate('/tenant-settings/subscription');
          }}
        />
      </div>
    </div>
  );
}

export default UpsellNotice;
