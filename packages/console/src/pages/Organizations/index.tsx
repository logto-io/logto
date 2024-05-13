import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';

import Plus from '@/assets/icons/plus.svg';
import PageMeta from '@/components/PageMeta';
import { organizationsFeatureLink } from '@/consts';
import { isCloud } from '@/consts/env';
import { subscriptionPage } from '@/consts/pages';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import CardTitle from '@/ds-components/CardTitle';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as pageLayout from '@/scss/page-layout.module.scss';

import CreateOrganizationModal from './CreateOrganizationModal';
import OrganizationsTable from './OrganizationsTable';
import EmptyDataPlaceholder from './OrganizationsTable/EmptyDataPlaceholder';
import * as styles from './index.module.scss';

const organizationsPathname = '/organizations';

function Organizations() {
  const { getDocumentationUrl } = useDocumentationUrl();
  const { currentPlan } = useContext(SubscriptionDataContext);
  const { isDevTenant } = useContext(TenantsContext);

  const { navigate } = useTenantPathname();
  const [isCreating, setIsCreating] = useState(false);

  const isOrganizationsDisabled = isCloud && !currentPlan.quota.organizationsEnabled;

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
          paywall={cond((isOrganizationsDisabled || isDevTenant) && ReservedPlanId.Pro)}
          title="organizations.title"
          subtitle="organizations.subtitle"
          learnMoreLink={{
            href: getDocumentationUrl(organizationsFeatureLink),
            targetBlank: 'noopener',
          }}
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
