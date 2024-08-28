import { type ReactNode } from 'react';

import Button from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import * as styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
  readonly onClickUpgrade?: () => void;
};

function QuotaGuardFooter({ children, isLoading, onClickUpgrade }: Props) {
  const { navigate } = useTenantPathname();

  return (
    <div className={styles.container}>
      <div className={styles.description}>{children}</div>
      <Button
        size="large"
        type="primary"
        title="upsell.upgrade_plan"
        isLoading={isLoading}
        onClick={() => {
          if (onClickUpgrade) {
            onClickUpgrade();
            return;
          }
          // Navigate to subscription page by default
          navigate('/tenant-settings/subscription');
        }}
      />
    </div>
  );
}

export default QuotaGuardFooter;
