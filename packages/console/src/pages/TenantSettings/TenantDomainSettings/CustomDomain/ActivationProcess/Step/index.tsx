import { type AdminConsoleKey } from '@logto/phrases';
import { DomainStatus } from '@logto/schemas';
import classNames from 'classnames';
import { type ReactNode } from 'react';

import Success from '@/assets/icons/success.svg?react';
import Tip from '@/assets/icons/tip.svg?react';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import { Ring } from '@/ds-components/Spinner';
import ToggleTip from '@/ds-components/Tip/ToggleTip';

import styles from './index.module.scss';

type Props = {
  readonly step: number;
  readonly title: AdminConsoleKey;
  readonly tip?: AdminConsoleKey;
  readonly domainStatus: DomainStatus;
  readonly children?: ReactNode;
};

const domainStatusToStep: Record<DomainStatus, number> = {
  [DomainStatus.Error]: 0,
  [DomainStatus.PendingVerification]: 1,
  [DomainStatus.PendingSsl]: 2,
  [DomainStatus.Active]: 3,
};

function Step({ step, title, tip, domainStatus, children }: Props) {
  const domainStatusStep = domainStatusToStep[domainStatus];

  const isPending = step > domainStatusStep;
  const isLoading = step === domainStatusStep;
  const isFinished = step < domainStatusStep;

  return (
    <div className={styles.step}>
      <div className={styles.header}>
        <div
          className={classNames(
            styles.stepIcon,
            isLoading && styles.loading,
            isFinished && styles.finished
          )}
        >
          {isPending && step}
          {isLoading && <Ring />}
          {isFinished && <Success className={styles.icon} />}
        </div>
        <div className={styles.title}>
          <DynamicT forKey={title} />
        </div>
        {tip && (
          <ToggleTip
            anchorClassName={styles.tip}
            content={<DynamicT forKey={tip} />}
            horizontalAlign="start"
          >
            <IconButton size="small">
              <Tip />
            </IconButton>
          </ToggleTip>
        )}
      </div>
      <div className={styles.contentContainer}>{children}</div>
    </div>
  );
}

export default Step;
