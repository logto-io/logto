import { withAppInsights } from '@logto/app-insights/react';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import ProTag from '@/components/ProTag';
import { contactEmailLink } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useCustomDomain from '@/hooks/use-custom-domain';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import useTenantPathname from '@/hooks/use-tenant-pathname';

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
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();

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
        tag={<ProTag />}
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
            <InlineNotification
              hasIcon={false}
              severity="info"
              action="upsell.compare_plans"
              className={styles.upsellNotification}
              onClick={() => {
                navigate('/tenant-settings/subscription');
              }}
            >
              <Trans
                components={{
                  a: <TextLink href={contactEmailLink} target="_blank" />,
                }}
              >
                {t('upsell.paywall.custom_domain')}
              </Trans>
            </InlineNotification>
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
