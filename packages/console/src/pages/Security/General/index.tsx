import { FormCardSkeleton } from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import RequestDataError from '@/components/RequestDataError';

import GeneralForm from './GeneralForm';
import styles from './index.module.scss';
import useDataFetch from './use-data-fetch';

function General() {
  const { isLoading, formData, error, mutate } = useDataFetch();

  return (
    <div className={styles.content}>
      <PageMeta titleKey={['security.tabs.general', 'security.page_title']} />
      {isLoading ? <FormCardSkeleton formFieldCount={2} /> : null}
      {error && <RequestDataError error={error} onRetry={mutate} />}
      {formData && <GeneralForm formData={formData} />}
    </div>
  );
}

export default General;
