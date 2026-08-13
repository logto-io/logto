import { Tooltip } from '@/ds-components/Tip';

import styles from './index.module.scss';

type Props = {
  /** The raw client identifier. */
  readonly value: string;
  /**
   * Whether to wrap the identifier across lines instead of truncating it to one. Table cells keep
   * the one-line truncation (with the full value in a tooltip); detail pages have the
   * room to show the full identifier, which needs no tooltip.
   */
  readonly isWrapped?: boolean;
};

/**
 * A raw client identifier rendered as data: no name resolution, no link. Forensic
 * surfaces (audit logs, origin-app columns) show the original identifier — the
 * unforgeable fact — while management surfaces render the consent snapshot through
 * `DynamicAppName`.
 */
function ClientIdentifier({ value, isWrapped = false }: Props) {
  if (isWrapped) {
    return <span className={styles.wrapped}>{value}</span>;
  }

  return (
    <Tooltip className={styles.tooltip} anchorClassName={styles.identifier} content={value}>
      {value}
    </Tooltip>
  );
}

export default ClientIdentifier;
