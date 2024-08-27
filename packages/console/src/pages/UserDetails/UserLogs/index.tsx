import { useOutletContext } from 'react-router-dom';

import AuditLogTable from '@/components/AuditLogTable';

import type { UserDetailsOutletContext } from '../types';

import styles from './index.module.scss';

function UserLogs() {
  const {
    user: { id },
  } = useOutletContext<UserDetailsOutletContext>();

  return <AuditLogTable userId={id} className={styles.logs} />;
}

export default UserLogs;
