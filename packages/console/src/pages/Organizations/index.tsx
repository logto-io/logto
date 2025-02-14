import { cond } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';

import Plus from '@/assets/icons/plus.svg?react';
import PageMeta from '@/components/PageMeta';
import { organizationsFeatureLink } from '@/consts';
import { isCloud } from '@/consts/env';
import { subscriptionPage } from '@/consts/pages';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import CardTitle from '@/ds-components/CardTitle';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import pageLayout from '@/scss/page-layout.module.scss';
import { isFeatureEnabled, isPaidPlan } from '@/utils/subscription';

import CreateOrganizationModal from './CreateOrganizationModal';
import OrganizationsTable from './OrganizationsTable';
import EmptyDataPlaceholder from './OrganizationsTable/EmptyDataPlaceholder';
import styles from './index.module.scss';

const organizationsPathname = '/organizations';

function Organizations() {
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionQuota,
  } = useContext(SubscriptionDataContext);

  const { navigate } = useTenantPathname();
  const [isCreating, setIsCreating] = useState(false);

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  const isOrganizationsDisabled =
    isCloud && !isFeatureEnabled(currentSubscriptionQuota.organizationsLimit) && !isPaidTenant;

  const upgradePlan = useCallback(() => {
    navigate(subscriptionPage);
  }, [navigate]);

  const handleCreate = () => {
    setIsCreating(true);
  };

  return (
    <div className={pageLayout.container}>
      <CreateOrganizationModal
        isOpen={isCreating}
        onClose={(createdId?: string) => {
          if (createdId) {
            navigate(organizationsPathname + `/${createdId}`);
            return;
          }
          setIsCreating(false);
        }}
      />
      <PageMeta titleKey="organizations.page_title" />
      <div className={pageLayout.headline}>
        <CardTitle
          paywall={cond(!isPaidTenant && latestProPlanId)}
          hasAddOnTag={isPaidPlan(planId, isEnterprisePlan)}
          title="organizations.title"
          subtitle="organizations.subtitle"
          learnMoreLink={{ href: organizationsFeatureLink }}
        />
        {!isOrganizationsDisabled && (
          <Button
            icon={<Plus />}
            type="primary"
            size="large"
            title="organizations.create_organization"
            onClick={handleCreate}
          />
        )}
      </div>
      {isOrganizationsDisabled && (
        <Card className={styles.emptyCardContainer}>
          <EmptyDataPlaceholder
            buttonProps={{
              title: 'upsell.upgrade_plan',
              onClick: upgradePlan,
              // Set to `undefined` to override the default icon
              icon: undefined,
            }}
          />
        </Card>
      )}
      {!isOrganizationsDisabled && <OrganizationsTable onCreate={handleCreate} />}
    </div>
  );
}

export default Organizations;
