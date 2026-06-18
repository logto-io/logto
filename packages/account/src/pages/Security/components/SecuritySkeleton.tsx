import classNames from 'classnames';
import { type ReactNode } from 'react';

import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';

type SecuritySkeletonProps = {
  readonly ariaLabel: string;
  readonly children: ReactNode;
};

/** Accessible loading container shared by the security sections. */
export const SecuritySkeleton = ({ ariaLabel, children }: SecuritySkeletonProps) => (
  <div
    className={styles.skeletonContent}
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label={ariaLabel}
  >
    {children}
  </div>
);

type SecuritySkeletonBlockProps = {
  readonly className?: string;
};

/** A single shimmering placeholder block. */
const SecuritySkeletonBlock = ({ className }: SecuritySkeletonBlockProps) => (
  <div className={classNames(styles.skeletonBlock, className)} />
);

type SecurityRowSkeletonProps = {
  readonly hasAction: boolean;
};

/** Placeholder mirroring a single `SecurityRow` while data is loading. */
export const SecurityRowSkeleton = ({ hasAction }: SecurityRowSkeletonProps) => (
  <div className={classNames(styles.row, layoutClassNames.row)}>
    <div className={styles.topLine}>
      <div className={styles.iconWrap}>
        <SecuritySkeletonBlock className={styles.skeletonIcon} />
      </div>
      {hasAction && (
        <div className={styles.actions}>
          <SecuritySkeletonBlock className={styles.skeletonAction} />
        </div>
      )}
    </div>
    <div className={styles.skeletonTitleWrap}>
      <SecuritySkeletonBlock className={styles.skeletonTitle} />
    </div>
    <div className={styles.value}>
      <SecuritySkeletonBlock className={styles.skeletonValue} />
    </div>
  </div>
);
