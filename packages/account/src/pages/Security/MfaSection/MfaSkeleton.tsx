import classNames from 'classnames';

import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';

type Props = {
  readonly hasToggle: boolean;
  readonly rows: ReadonlyArray<{
    readonly key: string;
    readonly action?: unknown;
  }>;
};

const MfaSkeleton = ({ hasToggle, rows }: Props) => (
  <>
    {hasToggle && (
      <div className={styles.toggleRow}>
        <div className={styles.toggleInfo}>
          <div className={classNames(styles.skeletonBlock, styles.skeletonToggleTitle)} />
          <div className={classNames(styles.skeletonBlock, styles.skeletonToggleDescription)} />
        </div>
        <div className={classNames(styles.skeletonBlock, styles.skeletonSwitch)} />
      </div>
    )}
    {hasToggle && rows.length > 0 && <div className={styles.divider} />}
    {rows.map(({ key, action }) => (
      <div key={key} className={classNames(styles.row, layoutClassNames.row)}>
        <div className={styles.topLine}>
          <div className={styles.iconWrap}>
            <div className={classNames(styles.skeletonBlock, styles.skeletonIcon)} />
          </div>
          {Boolean(action) && (
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
    ))}
  </>
);

export default MfaSkeleton;
