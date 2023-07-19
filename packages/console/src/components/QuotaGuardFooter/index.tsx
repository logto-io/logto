import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/ds-components/Button';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

function QuotaGuardFooter({ children }: Props) {
  const navigate = useNavigate();
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
