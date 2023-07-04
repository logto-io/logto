import { withAppInsights } from '@logto/app-insights/react';

import PageMeta from '@/components/PageMeta';

function Subscription() {
  return (
    <div>
      <PageMeta titleKey={['tenants.tabs.subscription', 'tenants.title']} />
      WIP
    </div>
  );
}

export default withAppInsights(Subscription);
