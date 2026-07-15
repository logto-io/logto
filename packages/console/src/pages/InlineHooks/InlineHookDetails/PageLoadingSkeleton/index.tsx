import classNames from 'classnames';

import Card from '@/ds-components/Card';

import styles from './index.module.scss';

function PageLoadingSkeleton() {
  return (
    <div className={styles.content}>
      <div className={styles.blockShimmer} />
      <div>
        <div className={classNames(styles.textShimmer, styles.large)} />
        <Card className={styles.card}>
          <div className={classNames(styles.textShimmer, styles.title)} />
          <div className={styles.textShimmer} />
        </Card>
        <Card className={styles.card}>
          <div className={classNames(styles.textShimmer, styles.title)} />
          <div className={styles.textShimmer} />
        </Card>
        <Card className={styles.card}>
          <div className={classNames(styles.textShimmer, styles.title)} />
          <div className={styles.textShimmer} />
        </Card>
      </div>
    </div>
  );
}

export default PageLoadingSkeleton;
