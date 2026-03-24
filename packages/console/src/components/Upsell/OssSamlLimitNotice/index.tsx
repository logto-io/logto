import classNames from 'classnames';

import InlineNotification from '@/ds-components/InlineNotification';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function OssSamlLimitNotice({ className }: Props) {
  return (
    <InlineNotification
      severity="info"
      action="upsell.view_plans"
      href="https://logto.io/pricing"
      hrefTargetBlank="noopener"
      className={classNames(styles.notice, className)}
    >
      Your OSS instance supports up to 3 SAML applications. Upgrade to Logto Cloud for unlimited
      SAML apps and enterprise features.
    </InlineNotification>
  );
}

export default OssSamlLimitNotice;
