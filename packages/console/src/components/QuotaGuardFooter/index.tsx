import { type ReactNode } from 'react';

import Button from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

function QuotaGuardFooter({ children }: Props) {
  const { navigate } = useTenantPathname();
  return (
    <div className={styles.container}>
      <div className={styles.description}>{children}</div>
      <Button
        size="large"
        type="primary"
        title="upsell.upgrade_plan"
        onClick={() => {
          navigate('/tenant-settings/subscription');
        }}
      />
    </div>
  );
}

export default QuotaGuardFooter;
