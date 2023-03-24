import { useOutletContext } from 'react-router-dom';

import AuditLogTable from '@/components/AuditLogTable';

import * as styles from './index.module.scss';
import type { UserDetailsOutletContext } from '../types';

function UserLogs() {
  const {
    user: { id },
  } = useOutletContext<UserDetailsOutletContext>();

  return <AuditLogTable userId={id} className={styles.logs} />;
}

export default UserLogs;
