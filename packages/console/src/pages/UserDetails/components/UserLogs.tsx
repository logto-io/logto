import AuditLogTable from '@/components/AuditLogTable';

import * as styles from '../index.module.scss';

type Props = {
  userId: string;
};

const UserLogs = ({ userId }: Props) => {
  return (
    <div className={styles.logs}>
      <AuditLogTable userId={userId} />
    </div>
  );
};

export default UserLogs;
