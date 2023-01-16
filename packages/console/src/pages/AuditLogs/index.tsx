import AuditLogTable from '@/components/AuditLogTable';
import CardTitle from '@/components/CardTitle';
import * as resourcesStyles from '@/scss/resources.module.scss';

const AuditLogs = () => {
  return (
    <div className={resourcesStyles.container}>
      <div className={resourcesStyles.headline}>
        <CardTitle title="logs.title" subtitle="logs.subtitle" />
      </div>
      <AuditLogTable className={resourcesStyles.table} />
    </div>
  );
};

export default AuditLogs;
