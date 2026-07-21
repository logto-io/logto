import { type SignInExperience } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { FormCardSkeleton } from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import RequestDataError from '@/components/RequestDataError';
import { type RequestError } from '@/hooks/use-api';

import BlocklistForm from './BlocklistForm';
import styles from './index.module.scss';
import { buildEmailBlocklistPolicyFormData, type EmailBlocklistPolicyFormData } from './utils';

const useDataFetch = () => {
  const { data, error, isLoading, mutate } = useSWR<SignInExperience, RequestError>(
    'api/sign-in-exp'
  );

  const formData = useMemo<EmailBlocklistPolicyFormData | undefined>(() => {
    if (!data) {
      return;
    }

    return buildEmailBlocklistPolicyFormData(data);
  }, [data]);

  return {
    isLoading,
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
      {isLoading && <FormCardSkeleton formFieldCount={4} />}
      {error && <RequestDataError error={error} onRetry={mutate} />}
      {formData && <BlocklistForm formData={formData} />}
    </div>
  );
}

export default Blocklist;
