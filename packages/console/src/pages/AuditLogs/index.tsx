import { withAppInsights } from '@logto/app-insights/react';

import AuditLogTable from '@/components/AuditLogTable';
import CardTitle from '@/components/CardTitle';
import PageMeta from '@/components/PageMeta';
import * as pageLayout from '@/scss/page-layout.module.scss';

function AuditLogs() {
  return (
    <div className={pageLayout.container}>
      <PageMeta titleKey="logs.page_title" />
      <div className={pageLayout.headline}>
        <CardTitle title="logs.title" subtitle="logs.subtitle" />
      </div>
      <AuditLogTable className={pageLayout.table} />
    </div>
  );
}

export default withAppInsights(AuditLogs);
