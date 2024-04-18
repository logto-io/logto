import type { Application } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { shouldRetryOnError } from '@/utils/request';

import * as styles from './index.module.scss';

type Props = {
  readonly applicationId: string;
  readonly isLink?: boolean;
};

function ApplicationName({ applicationId, isLink = false }: Props) {
  const isAdminConsole = applicationId === adminConsoleApplicationId;

  const fetchApi = useApi({ hideErrorToast: true });
  const fetcher = useSwrFetcher<Application>(fetchApi);
  const { data, error } = useSWR<Application, RequestError>(
    !isAdminConsole && `api/applications/${applicationId}`,
    {
      fetcher,
      shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
    }
  );
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getTo } = useTenantPathname();

  const name = useMemo(() => {
    if (isAdminConsole) {
      return `Admin Console (${t('system_app')})`;
    }
    if (data?.name) {
      return data.name;
    }
    if (error?.status === 404) {
      return `${applicationId} (${t('general.deleted')})`;
    }
    return '-';
  }, [applicationId, data?.name, error?.status, isAdminConsole, t]);

  if (isLink && !isAdminConsole && data?.name) {
    return (
      <Link className={styles.link} to={getTo(`/applications/${applicationId}`)}>
        {name}
      </Link>
    );
  }

  return <span>{name}</span>;
}

export default ApplicationName;
