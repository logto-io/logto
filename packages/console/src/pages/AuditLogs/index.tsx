import AuditLogTable from '@/components/AuditLogTable';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';

import * as styles from './index.module.scss';

const AuditLogs = () => {
  return (
    <Card className={styles.card}>
      <div className={styles.headline}>
        <CardTitle title="logs.title" subtitle="logs.subtitle" />
      </div>
      <AuditLogTable />
    </Card>
  );
};

export default AuditLogs;
