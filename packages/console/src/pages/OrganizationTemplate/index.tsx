import { cond } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

import OrganizationEmptyDark from '@/assets/images/organization-empty-dark.svg?react';
import OrganizationEmpty from '@/assets/images/organization-empty.svg?react';
import Drawer from '@/components/Drawer';
import PageMeta from '@/components/PageMeta';
import { OrganizationTemplateTabs, organizationTemplateLink } from '@/consts';
import { isCloud } from '@/consts/env';
import { subscriptionPage } from '@/consts/pages';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import pageLayout from '@/scss/page-layout.module.scss';
import { isFeatureEnabled, isPaidPlan } from '@/utils/subscription';

import Introduction from '../Organizations/Introduction';

import styles from './index.module.scss';

const basePathname = '/organization-template';

function OrganizationTemplate() {
  const [isGuideDrawerOpen, setIsGuideDrawerOpen] = useState(false);
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionQuota,
  } = useContext(SubscriptionDataContext);
  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  const isOrganizationsDisabled =
    // Check if the organizations feature is disabled except for paid tenants.
    // Paid tenants can create organizations with organization feature add-on applied to their subscription.
    isCloud && !isFeatureEnabled(currentSubscriptionQuota.organizationsLimit) && !isPaidTenant;

  const { navigate } = useTenantPathname();

  const handleUpgradePlan = useCallback(() => {
    navigate(subscriptionPage);
  }, [navigate]);

  return (
    <div className={classNames(pageLayout.container, styles.container)}>
      <PageMeta titleKey="organization_template.title" />
      <div className={pageLayout.headline}>
        <CardTitle
          title="organization_template.title"
          subtitle="organization_template.subtitle"
          learnMoreLink={{ href: organizationTemplateLink }}
          paywall={cond(!isPaidTenant && latestProPlanId)}
        />
        <Button
          title="application_details.check_guide"
          type="outline"
          size="large"
          onClick={() => {
            setIsGuideDrawerOpen(true);
          }}
        />
        <Drawer
          title="organizations.guide.title"
          subtitle="organizations.guide.subtitle"
          isOpen={isGuideDrawerOpen}
          onClose={() => {
            setIsGuideDrawerOpen(false);
          }}
        >
          <Introduction />
        </Drawer>
      </div>
      {isOrganizationsDisabled && (
        <Card className={styles.paywallCard}>
          <TablePlaceholder
            title="organization_template.title"
            description="organization_template.subtitle"
            image={<OrganizationEmpty />}
            imageDark={<OrganizationEmptyDark />}
            action={
              <Button
                title="upsell.upgrade_plan"
                type="primary"
                size="large"
                onClick={handleUpgradePlan}
              />
            }
          />
        </Card>
      )}
      {!isOrganizationsDisabled && (
        <>
          <TabNav>
            <TabNavItem href={`${basePathname}/${OrganizationTemplateTabs.OrganizationRoles}`}>
              <DynamicT forKey="organization_template.roles.tab_name" />
            </TabNavItem>
            <TabNavItem
              href={`${basePathname}/${OrganizationTemplateTabs.OrganizationPermissions}`}
            >
              <DynamicT forKey="organization_template.permissions.tab_name" />
            </TabNavItem>
          </TabNav>
          <Outlet />
        </>
      )}
    </div>
  );
}

export default OrganizationTemplate;
