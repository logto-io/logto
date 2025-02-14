import AuditLogTable from '@/components/AuditLogTable';
import PageMeta from '@/components/PageMeta';
import { auditLogs } from '@/consts';
import CardTitle from '@/ds-components/CardTitle';
import pageLayout from '@/scss/page-layout.module.scss';

function AuditLogs() {
  return (
    <div className={pageLayout.container}>
      <PageMeta titleKey="logs.page_title" />
      <div className={pageLayout.headline}>
        <CardTitle
          title="logs.title"
          subtitle="logs.subtitle"
          learnMoreLink={{ href: auditLogs }}
        />
      </div>
      <AuditLogTable className={pageLayout.table} />
    </div>
  );
}

export default AuditLogs;
