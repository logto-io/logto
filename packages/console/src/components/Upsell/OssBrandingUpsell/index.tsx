import classNames from 'classnames';

import Switch from '@/ds-components/Switch';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function OssBrandingUpsell({ className }: Props) {
  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.header}>
        <span className={styles.label}>Remove &lsquo;Powered by Logto&rsquo;</span>
        <span className={styles.badge}>Cloud</span>
      </div>
      <Switch label={<span>Remove Logto branding from the sign-in page</span>} disabled />
      <div className={styles.note}>
        Upgrade to Logto Cloud to remove branding from your sign-in experience.
      </div>
    </div>
  );
}

export default OssBrandingUpsell;
