import { type Domain } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import useSWR from 'swr';

import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import { customDomainSyncInterval } from '@/consts/custom-domain';
import useApi, { type RequestError } from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';

import AddDomainForm from './AddDomainForm';
import CustomDomain from './CustomDomain';
import DefaultDomain from './DefaultDomain';
import * as styles from './index.module.scss';

function TenantDomainSettings() {
  const api = useApi();
  const fetcher = useSwrFetcher<Domain[]>(api);
  const { data, error, mutate } = useSWR<Domain[], RequestError>('api/domains', fetcher, {
    refreshInterval: customDomainSyncInterval * 1000,
  });

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
          {customDomain ? (
            <CustomDomain
              customDomain={customDomain}
              onDeleteCustomDomain={() => {
                void mutate();
              }}
            />
          ) : (
            <AddDomainForm
              onCustomDomainAdded={(domain) => {
                void mutate([domain]);
              }}
            />
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

export default TenantDomainSettings;
