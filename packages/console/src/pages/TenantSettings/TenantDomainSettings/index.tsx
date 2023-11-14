import { withAppInsights } from '@logto/app-insights/react';
import { useContext } from 'react';

import FeatureTag from '@/components/FeatureTag';
import FormCard from '@/components/FormCard';
import InlineUpsell from '@/components/InlineUpsell';
import PageMeta from '@/components/PageMeta';
import { ReservedPlanId } from '@/consts/subscriptions';
import { TenantsContext } from '@/contexts/TenantsProvider';
import FormField from '@/ds-components/FormField';
import useCustomDomain from '@/hooks/use-custom-domain';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';

import Skeleton from '../components/Skeleton';

import AddDomainForm from './AddDomainForm';
import CustomDomain from './CustomDomain';
import DefaultDomain from './DefaultDomain';
import * as styles from './index.module.scss';

function TenantDomainSettings() {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: customDomain, isLoading: isLoadingCustomDomain, mutate } = useCustomDomain(true);
  const { data: currentPlan, error: fetchCurrentPlanError } = useSubscriptionPlan(currentTenantId);
  const isLoadingCurrentPlan = !currentPlan && !fetchCurrentPlanError;
  const { getDocumentationUrl } = useDocumentationUrl();

  if (isLoadingCustomDomain || isLoadingCurrentPlan) {
    return <Skeleton />;
  }

  const customDomainEnabled =
    Boolean(currentPlan?.quota.customDomainEnabled) ||
    /**
     * Note: this is for tenants which already have a custom domain before we have subscription features.
     */
    Boolean(customDomain);

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.domains', 'tenants.title']} />
      <FormCard
        title="domain.custom.custom_domain"
        tag={
          <FeatureTag isVisible={!customDomainEnabled} for="upsell" plan={ReservedPlanId.hobby} />
        }
        description="domain.custom.custom_domain_description"
        learnMoreLink={getDocumentationUrl('docs/recipes/custom-domain')}
      >
        <FormField title="domain.custom.custom_domain_field">
          {customDomain ? (
            <CustomDomain customDomain={customDomain} onDeleteCustomDomain={mutate} />
          ) : (
            <AddDomainForm
              isCustomDomainEnabled={customDomainEnabled}
              onCustomDomainAdded={mutate}
            />
          )}
          {!customDomain && !customDomainEnabled && (
            <InlineUpsell for="custom_domain" className={styles.upsellNotification} />
          )}
        </FormField>
      </FormCard>
      <FormCard
        title="domain.default.default_domain"
        description="domain.default.default_domain_description"
      >
        <FormField title="domain.default.default_domain_field">
          <DefaultDomain />
        </FormField>
      </FormCard>
    </div>
  );
}

export default withAppInsights(TenantDomainSettings);
