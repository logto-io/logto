import { type Domain } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import useSWR from 'swr';

import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import { type RequestError } from '@/hooks/use-api';

import AddDomainForm from './components/AddDomainForm';
import DefaultDomain from './components/DefaultDomain';
import * as styles from './index.module.scss';

function TenantDomainSettings() {
  // Todo: @xiaoyijun setup the auto refresh interval for the domains when implementing the active domain process.
  const { data, error, mutate } = useSWR<Domain[], RequestError>('api/domains');
  const isLoading = !data && !error;
  /**
   * Note: we can only create a custom domain, and we don't have a default id for it, so the first element of the array is the custom domain.
   */
  const customDomain = conditional(!isLoading && data)?.[0];

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <FormCard
        title="domain.custom.custom_domain"
        description="domain.custom.custom_domain_description"
      >
        <FormField title="domain.custom.custom_domain_field">
          {!customDomain && (
            <AddDomainForm
              onCustomDomainAdded={(domain) => {
                void mutate([domain]);
              }}
            />
          )}
          {/* TODO @xiaoyijun add custom domain content if a custom domain is created */}
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

export default TenantDomainSettings;
