import classNames from 'classnames';

import { SecurityRowSkeleton } from '../components/SecuritySkeleton';

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
      <SecurityRowSkeleton key={key} hasAction={Boolean(action)} />
    ))}
  </>
);

export default MfaSkeleton;
