import { type emailLogsRouter } from '@logto/cloud/routes';
import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantEmailLogsResponse } from '@/cloud/types/router';
import { TenantsContext } from '@/contexts/TenantsProvider';

import { buildEmailLogsSearch } from './utils';

type Props = {
  /** Window start in epoch milliseconds; omitted when the picker has no valid start. */
  readonly startTime?: number;
  /** Inclusive window end in epoch milliseconds, as produced by the audit-log time window. */
  readonly endTime?: number;
  /** Full recipient address; the endpoint matches it case-insensitively and exactly. */
  readonly recipient?: string;
  /** 1-based page index, owned by the URL search parameters. */
  readonly page: number;
  /** Rows per page; the caller shares one binding between this fetch and the footer's math. */
  readonly pageSize: number;
};

/**
 * Fetches one page of hosted-email logs for the current tenant (Cloud only). The endpoint is
 * page-based with a capped total count — the same pagination contract the audit-log table
 * consumes.
 */
const useEmailLogs = ({ startTime, endTime, recipient, page, pageSize }: Props) => {
  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi<typeof emailLogsRouter>({ hideErrorToast: true });

  const { data, error, mutate } = useSWR<TenantEmailLogsResponse, unknown>(
    conditional(
      currentTenantId && [
        'email-logs',
        currentTenantId,
        startTime,
        endTime,
        recipient ?? '',
        page,
        pageSize,
      ]
    ),
    async () =>
      cloudApi.get('/api/tenants/:tenantId/email-logs', {
        params: { tenantId: currentTenantId },
        search: buildEmailLogsSearch({ startTime, endTime, recipient, page, pageSize }),
      })
  );

  return {
    logs: data?.logs,
    totalCount: data?.totalCount,
    isTotalCountCapped: data?.isTotalCountCapped,
    error,
    // Loading only while the fetch is actually enabled — with no tenant id the key is null and
    // SWR never fires, which would otherwise read as loading forever.
    isLoading: Boolean(currentTenantId) && !data && !error,
    mutate,
  };
};

export default useEmailLogs;
