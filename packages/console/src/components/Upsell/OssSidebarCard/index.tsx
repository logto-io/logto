import CloudIcon from '@/assets/icons/cloud.svg?react';

import styles from './index.module.scss';

type Props = {
  readonly onClose: () => void;
};

function OssSidebarCard({ onClose }: Props) {
  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.closeButton}
        aria-label="Dismiss"
        onClick={onClose}
      >
        &times;
      </button>
      <CloudIcon className={styles.cloudIcon} />
      <div className={styles.title}>Explore Logto Cloud</div>
      <div className={styles.description}>
        Get built-in email, team collaboration, custom domain, and more.
      </div>
      <a
        className={styles.cta}
        href="https://cloud.logto.io"
        target="_blank"
        rel="noopener"
      >
        Learn more &rarr;
      </a>
    </div>
  );
}

export default OssSidebarCard;
