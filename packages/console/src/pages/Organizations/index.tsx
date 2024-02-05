import { ReservedPlanId } from '@logto/schemas';
import { cond, conditional, joinPath } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useConfigs from '@/hooks/use-configs';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as pageLayout from '@/scss/page-layout.module.scss';

import CreateOrganizationModal from './CreateOrganizationModal';
import OrganizationsTable from './OrganizationsTable';
import EmptyDataPlaceholder from './OrganizationsTable/EmptyDataPlaceholder';
import Settings from './Settings';
import { guidePathname, organizationsPathname } from './consts';
import * as styles from './index.module.scss';

const tabs = Object.freeze({
  template: 'template',
});

type Props = {
  tab?: keyof typeof tabs;
};

function Organizations({ tab }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { currentPlan } = useContext(SubscriptionDataContext);
  const { isDevTenant } = useContext(TenantsContext);

  const { navigate } = useTenantPathname();
  const [isCreating, setIsCreating] = useState(false);
  const { configs, isLoading: isLoadingConfigs } = useConfigs();
  const isInitialSetup = !isLoadingConfigs && !configs?.organizationCreated;
  const isOrganizationsDisabled = isCloud && !currentPlan.quota.organizationsEnabled;

  const upgradePlan = useCallback(() => {
    navigate(subscriptionPage);
  }, [navigate]);

  const handleCreate = useCallback(() => {
    if (isInitialSetup) {
      navigate(guidePathname);
      return;
    }
    setIsCreating(true);
  }, [isInitialSetup, navigate]);

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
        {!isInitialSetup && (
          <Button
            icon={<Plus />}
            type="primary"
            size="large"
            title="organizations.create_organization"
            onClick={handleCreate}
          />
        )}
      </div>
      {isInitialSetup && (
        <Card className={styles.emptyCardContainer}>
          <EmptyDataPlaceholder
            buttonProps={{
              title: isOrganizationsDisabled
                ? 'upsell.upgrade_plan'
                : 'organizations.setup_organization',
              onClick: isOrganizationsDisabled ? upgradePlan : handleCreate,
              ...conditional(isOrganizationsDisabled && { icon: undefined }),
            }}
          />
        </Card>
      )}
      {!isInitialSetup && (
        <>
          <TabNav className={styles.tabs}>
            <TabNavItem href="/organizations" isActive={!tab}>
              {t('organizations.title')}
            </TabNavItem>
            <TabNavItem
              href={joinPath('/organizations', tabs.template)}
              isActive={tab === 'template'}
            >
              {t('organizations.organization_template')}
            </TabNavItem>
          </TabNav>
          {!tab && <OrganizationsTable isLoading={isLoadingConfigs} onCreate={handleCreate} />}
          {tab === 'template' && <Settings />}
        </>
      )}
    </div>
  );
}

export default Organizations;
