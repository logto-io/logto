import { appInsightsReact } from '@logto/app-insights/lib/react';

import AuditLogTable from '@/components/AuditLogTable';
import CardTitle from '@/components/CardTitle';
import PageMeta from '@/components/PageMeta';
import * as resourcesStyles from '@/scss/resources.module.scss';

function AuditLogs() {
  return (
    <div className={resourcesStyles.container}>
      <PageMeta titleKey="logs.page_title" />
      <div className={resourcesStyles.headline}>
        <CardTitle title="logs.title" subtitle="logs.subtitle" />
      </div>
      <AuditLogTable className={resourcesStyles.table} />
    </div>
  );
}

export default appInsightsReact.withAppInsights(AuditLogs);
