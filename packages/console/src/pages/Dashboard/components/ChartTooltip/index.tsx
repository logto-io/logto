import { formatNumberWithComma } from '@/utils/number';

import * as styles from './index.module.scss';

type Props = {
  readonly label?: string;
  readonly payload?: Array<{ payload: { count: number; date: string } }>;
};

function ChartTooltip({ label, payload }: Props) {
  if (!label || !payload?.[0]) {
    return null;
  }

  return (
    <div className={styles.chartTooltip}>
      <div className={styles.value}>{formatNumberWithComma(payload[0].payload.count)}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}

export default ChartTooltip;
