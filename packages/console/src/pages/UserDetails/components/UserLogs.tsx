import AuditLogTable from '@/components/AuditLogTable';
import Card from '@/components/Card';

import * as styles from './UserLogs.module.scss';

type Props = {
  userId: string;
};

const UserLogs = ({ userId }: Props) => {
  return (
    <Card className={styles.logs}>
      <AuditLogTable userId={userId} />
    </Card>
  );
};

export default UserLogs;
