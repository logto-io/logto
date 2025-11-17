import { useContext } from 'react';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import { isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import FormField from '@/ds-components/FormField';
import useCustomDomain from '@/hooks/use-custom-domain';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import Skeleton from '../components/Skeleton';

import DefaultDomain from './DefaultDomain';
import MultipleCustomDomainsFormField from './MultipleCustomDomainsFormField';
import SingleCustomDomainFormField from './SingleCustomDomainFormField';
import styles from './index.module.scss';

function TenantDomainSettings() {
  const { isLoading: isLoadingCustomDomain } = useCustomDomain(true);
  const { getDocumentationUrl } = useDocumentationUrl();
  const { currentTenant } = useContext(TenantsContext);

  // TODO @xiaoyijun: remove the dev feature flag
  const isMultipleCustomDomainsEnabled =
    isDevFeaturesEnabled || Boolean(currentTenant?.featureFlags?.isMultipleCustomDomainsEnabled);

  if (isLoadingCustomDomain) {
    return <Skeleton />;
  }

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.domains', 'tenants.title']} />
      <FormCard
        title="domain.custom.custom_domain"
        description="domain.custom.custom_domain_description"
        learnMoreLink={{
          href: getDocumentationUrl('docs/recipes/custom-domain'),
          targetBlank: 'noopener',
        }}
      >
        {isMultipleCustomDomainsEnabled ? (
          <MultipleCustomDomainsFormField />
        ) : (
          <SingleCustomDomainFormField />
        )}
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

export default TenantDomainSettings;
