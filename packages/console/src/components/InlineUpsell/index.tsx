import classNames from 'classnames';
import { type TFuncKey } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';

import { contactEmailLink } from '@/consts';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  for: TFuncKey<'translation', 'admin_console.upsell.paywall'>;
};

/** Displays an inline notification that explains the paywall and links to the subscription page. */
function InlineUpsell({ className, for: forFeature }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });
  const { navigate } = useTenantPathname();

  return (
    <InlineNotification
      hasIcon={false}
      severity="info"
      action="upsell.compare_plans"
      className={classNames(styles.notification, className)}
      onClick={() => {
        navigate('/tenant-settings/subscription');
      }}
    >
      <Trans
        components={{
          a: <TextLink href={contactEmailLink} target="_blank" />,
        }}
      >
        {t(forFeature)}
      </Trans>
    </InlineNotification>
  );
}

export default InlineUpsell;
