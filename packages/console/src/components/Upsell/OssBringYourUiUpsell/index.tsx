import WebIcon from '@/assets/icons/web.svg?react';

import styles from './index.module.scss';

function OssBringYourUiUpsell() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Bring your UI</span>
        <span className={styles.badge}>Cloud</span>
      </div>
      <div className={styles.description}>
        In OSS, you can fork the code to customize the sign-in UI.
      </div>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <WebIcon className={styles.icon} />
        </div>
        <div className={styles.cardText}>
          Upload custom sign-in UI assets with zero configuration on Logto Cloud.
        </div>
        <a
          className={styles.cloudLink}
          href="https://cloud.logto.io"
          target="_blank"
          rel="noopener"
        >
          {'Try Cloud \u2192'}
        </a>
      </div>
    </div>
  );
}

export default OssBringYourUiUpsell;
