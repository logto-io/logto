import { DomainStatus, type Domain } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type CombinedAddOnAndFeatureTagProps } from '@/components/FeatureTag';
import LearnMore from '@/components/LearnMore';
import { customDomain as customDomainDocumentationLink } from '@/consts/external-links';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import FormField from '@/ds-components/FormField';
import useApi from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useCustomDomain from '@/hooks/use-custom-domain';
import usePaywall from '@/hooks/use-paywall';

import AddDomainForm from '../AddDomainForm';
import CustomDomain from '../CustomDomain';

import PaywallNotification from './PaywallNotification';
import styles from './index.module.scss';

function MultipleCustomDomainsFormField() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { allDomains, mutate, shouldDisplayFeatureAddOnTag, shouldDisplayUpsellNotification } =
    useCustomDomain(true);
  const api = useApi();
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();
  const { hasReachedSubscriptionQuotaLimit } = useContext(SubscriptionDataContext);
  const { isPaidTenant } = usePaywall();
  const { currentTenant } = useContext(TenantsContext);
  const { isFreeTenant } = usePaywall();

  const hasReachedQuotaLimit = hasReachedSubscriptionQuotaLimit('customDomainsLimit');

  const canAddDomain = useMemo(() => {
    if (!canManageTenant) {
      return false;
    }

    if (isPaidTenant) {
      return true;
    }

    /**
     * Specifically for private region users who have enabled multiple custom domains feature flag.
     *
     * TODO @xiaoyijun: remove this special handling after enterprise subscription is live
     */
    if (currentTenant?.featureFlags?.isMultipleCustomDomainsEnabled) {
      return true;
    }

    return !hasReachedQuotaLimit;
  }, [
    canManageTenant,
    currentTenant?.featureFlags?.isMultipleCustomDomainsEnabled,
    hasReachedQuotaLimit,
    isPaidTenant,
  ]);

  const addOnFeatureTagProps = useMemo<Optional<CombinedAddOnAndFeatureTagProps>>(() => {
    if (shouldDisplayFeatureAddOnTag) {
      return {
        hasAddOnTag: !isFreeTenant,
        paywall: latestProPlanId,
      };
    }
  }, [isFreeTenant, shouldDisplayFeatureAddOnTag]);

  return (
    <>
      <FormField
        title="domain.custom.add_custom_domain_field"
        addOnFeatureTag={addOnFeatureTagProps}
      >
        <AddDomainForm
          isReadonly={!canAddDomain}
          onSubmitCustomDomain={async (json) => {
            const createdDomain = await api.post('api/domains', { json }).json<Domain>();
            mutate(createdDomain);
          }}
        />
        {shouldDisplayUpsellNotification && <PaywallNotification />}
      </FormField>
      {allDomains.length > 0 && (
        <FormField title="domain.custom.custom_domain_field">
          {allDomains.map((domain) => (
            <CustomDomain
              key={domain.id}
              hasExtraTipsOnDelete
              className={styles.domainItem}
              isReadonly={!canManageTenant}
              customDomain={domain}
              onDeleteCustomDomain={async () => {
                await api.delete(`api/domains/${domain.id}`);
                mutate();
              }}
            />
          ))}
          {allDomains.some(({ status }) => status === DomainStatus.Active) && (
            <div className={styles.configDescription}>
              {t('domain.custom.config_custom_domain_description')}
              <LearnMore href={customDomainDocumentationLink} />{' '}
            </div>
          )}
        </FormField>
      )}
    </>
  );
}

export default MultipleCustomDomainsFormField;
