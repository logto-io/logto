import * as pageLayout from '@/onboarding/scss/layout.module.scss';

import * as sieLayout from '../index.module.scss';

import * as styles from './index.module.scss';

function Skeleton() {
  return (
    <div className={pageLayout.page}>
      <div className={pageLayout.contentContainer}>
        <div className={sieLayout.content}>
          <div className={sieLayout.config}>
            {Array.from({ length: 3 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className={styles.fieldWrapper}>
                <div className={styles.title} />
                <div className={styles.field} />
                <div className={styles.field} />
              </div>
            ))}
          </div>
          <div className={styles.preview}>
            <div className={styles.header}>
              <div className={styles.button} />
              <div className={styles.actions}>
                <div className={styles.smallButton} />
                <div className={styles.button} />
              </div>
            </div>
            <div className={styles.mobile}>
              <div className={styles.logo} />
              <div className={styles.slogan} />
              <div className={styles.field} />
              <div className={styles.field} />
              <div className={styles.button} />
              <div className={styles.social} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
