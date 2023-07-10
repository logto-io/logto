import { withAppInsights } from '@logto/app-insights/react';

import PageMeta from '@/components/PageMeta';

import PlanQuotaTable from './PlanQuotaTable';

function Subscription() {
  return (
    <div>
      <PageMeta titleKey={['tenants.tabs.subscription', 'tenants.title']} />
      <PlanQuotaTable />
    </div>
  );
}

export default withAppInsights(Subscription);
