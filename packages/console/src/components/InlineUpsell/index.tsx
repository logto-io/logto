import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { type TFuncKey } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';

import InlineNotification from '@/ds-components/InlineNotification';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import ContactUsPhraseLink from '../ContactUsPhraseLink';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly for: TFuncKey<'translation', 'admin_console.upsell.paywall'>;
  /**
   * The text to be displayed on the clickable action button which links to the subscription page.
   * @default 'upsell.compare_plans'
   */
  readonly actionButtonText?: AdminConsoleKey;
};

/** Displays an inline notification that explains the paywall and provides a clickable action button which links to the subscription page. */
function InlineUpsell({ className, for: forFeature, actionButtonText }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });
  const { navigate } = useTenantPathname();

  return (
    <InlineNotification
      hasIcon={false}
      severity="info"
      action={actionButtonText ?? 'upsell.compare_plans'}
      className={classNames(styles.notification, className)}
      onClick={() => {
        navigate('/tenant-settings/subscription');
      }}
    >
      <Trans
        components={{
          a: <ContactUsPhraseLink />,
        }}
      >
        {t(forFeature)}
      </Trans>
    </InlineNotification>
  );
}

export default InlineUpsell;
