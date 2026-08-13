import { Tooltip } from '@/ds-components/Tip';

import styles from './index.module.scss';

type Props = {
  /** The raw client identifier, truncated to one line with the full value in a tooltip. */
  readonly value: string;
};

/**
 * A raw client identifier rendered as data: no name resolution, no link. Forensic
 * surfaces (audit logs, origin-app columns) show the original identifier — the
 * unforgeable fact — while management surfaces render the consent snapshot through
 * `DynamicAppName`.
 */
function ClientIdentifier({ value }: Props) {
  return (
    <Tooltip className={styles.tooltip} anchorClassName={styles.identifier} content={value}>
      {value}
    </Tooltip>
  );
}

export default ClientIdentifier;
