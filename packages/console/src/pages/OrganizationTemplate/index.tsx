import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

import OrganizationEmptyDark from '@/assets/images/organization-empty-dark.svg';
import OrganizationEmpty from '@/assets/images/organization-empty.svg';
import Drawer from '@/components/Drawer';
import PageMeta from '@/components/PageMeta';
import { OrganizationTemplateTabs, organizationTemplateLink } from '@/consts';
import { isCloud } from '@/consts/env';
import { subscriptionPage } from '@/consts/pages';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as pageLayout from '@/scss/page-layout.module.scss';

import Introduction from '../Organizations/Introduction';

import * as styles from './index.module.scss';

const basePathname = '/organization-template';

function OrganizationTemplate() {
  const { getDocumentationUrl } = useDocumentationUrl();
  const [isGuideDrawerOpen, setIsGuideDrawerOpen] = useState(false);
  const { currentPlan } = useContext(SubscriptionDataContext);
  const { isDevTenant } = useContext(TenantsContext);
  const isOrganizationsDisabled = isCloud && !currentPlan.quota.organizationsEnabled;
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
          learnMoreLink={{
            href: getDocumentationUrl(organizationTemplateLink),
            targetBlank: 'noopener',
          }}
          paywall={cond((isOrganizationsDisabled || isDevTenant) && ReservedPlanId.Pro)}
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
