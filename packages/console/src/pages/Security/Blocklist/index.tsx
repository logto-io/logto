import { type SignInExperience, type EmailBlocklistPolicy } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { FormCardSkeleton } from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import RequestDataError from '@/components/RequestDataError';
import { type RequestError } from '@/hooks/use-api';

import BlocklistForm from './BlocklistForm';
import styles from './index.module.scss';

const defaultBlockListPolicy: EmailBlocklistPolicy = {
  blockDisposableAddresses: false,
  blockSubaddressing: false,
  customBlocklist: [],
};

const useDataFetch = () => {
  const { data, error, isLoading, mutate } = useSWR<SignInExperience, RequestError>(
    'api/sign-in-exp'
  );

  const formData = useMemo<EmailBlocklistPolicy | undefined>(() => {
    if (!data) {
      return;
    }

    const { emailBlocklistPolicy } = data;

    /**
     * Since all properties in the {@link EmailBlocklistPolicy} are optional, we need to
     * provide default values for any missing properties in the response.
     * This ensures consistency in the form data and prevents unexpected discrepancies.
     */
    return {
      ...defaultBlockListPolicy,
      ...emailBlocklistPolicy,
    };
  }, [data]);

  return {
    isLoading: isLoading && !error,
    formData,
    error,
    mutate,
  };
};

function Blocklist() {
  const { isLoading, formData, error, mutate } = useDataFetch();

  return (
    <div className={styles.content}>
      <PageMeta titleKey={['security.tabs.blocklist', 'security.page_title']} />
      {isLoading ? <FormCardSkeleton formFieldCount={2} /> : null}
      {error && <RequestDataError error={error} onRetry={mutate} />}
      {formData && <BlocklistForm formData={formData} />}
    </div>
  );
}

export default Blocklist;
