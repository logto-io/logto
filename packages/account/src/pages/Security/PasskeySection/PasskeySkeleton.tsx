import classNames from 'classnames';

import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';

type Props = {
  readonly hasAction: boolean;
};

const PasskeySkeleton = ({ hasAction }: Props) => (
  <div className={classNames(styles.row, layoutClassNames.row)}>
    <div className={styles.topLine}>
      <div className={styles.iconWrap}>
        <div className={classNames(styles.skeletonBlock, styles.skeletonIcon)} />
      </div>
      {hasAction && (
        <div className={styles.actions}>
          <div className={classNames(styles.skeletonBlock, styles.skeletonAction)} />
        </div>
      )}
    </div>
    <div className={styles.skeletonTitleWrap}>
      <div className={classNames(styles.skeletonBlock, styles.skeletonTitle)} />
    </div>
    <div className={styles.value}>
      <div className={classNames(styles.skeletonBlock, styles.skeletonValue)} />
    </div>
  </div>
);

export default PasskeySkeleton;
