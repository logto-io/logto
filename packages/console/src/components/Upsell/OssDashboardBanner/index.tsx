import CloudIcon from '@/assets/icons/cloud.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';
import { LinkButton } from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import IconButton from '@/ds-components/IconButton';

import styles from './index.module.scss';

type Props = {
  readonly onClose: () => void;
};

function OssDashboardBanner({ onClose }: Props) {
  return (
    <div className={styles.banner}>
      <CloudIcon className={styles.cloudIcon} />
      <div className={styles.content}>
        <div className={styles.title}>Explore Logto Cloud</div>
        <div className={styles.description}>
          Get built-in email service, team collaboration, custom domain, enterprise SSO, and more
          — fully managed with zero maintenance.
        </div>
      </div>
      <div className={styles.actions}>
        <LinkButton
          type="outline"
          size="small"
          title={<DangerousRaw>Compare plans</DangerousRaw>}
          href="https://logto.io/pricing"
          targetBlank="noopener"
        />
        <LinkButton
          type="branding"
          size="small"
          title={<DangerousRaw>Try Cloud free</DangerousRaw>}
          href="https://cloud.logto.io"
          targetBlank="noopener"
        />
      </div>
      <IconButton className={styles.closeButton} size="small" onClick={onClose}>
        <CloseIcon className={styles.closeIcon} />
      </IconButton>
    </div>
  );
}

export default OssDashboardBanner;
