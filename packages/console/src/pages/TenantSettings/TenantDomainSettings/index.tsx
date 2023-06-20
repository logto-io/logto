import { withAppInsights } from '@logto/app-insights/react';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import FormField from '@/ds-components/FormField';
import useCustomDomain from '@/hooks/use-custom-domain';

import AddDomainForm from './AddDomainForm';
import CustomDomain from './CustomDomain';
import DefaultDomain from './DefaultDomain';
import * as styles from './index.module.scss';

function TenantDomainSettings() {
  const { data: customDomain, isLoading, mutate } = useCustomDomain(true);

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenant_settings.tabs.domains', 'tenant_settings.title']} />
      <FormCard
        title="domain.custom.custom_domain"
        description="domain.custom.custom_domain_description"
      >
        <FormField title="domain.custom.custom_domain_field">
          {customDomain ? (
            <CustomDomain customDomain={customDomain} onDeleteCustomDomain={mutate} />
          ) : (
            <AddDomainForm onCustomDomainAdded={mutate} />
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
