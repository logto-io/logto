import { type emailLogsRouter } from '@logto/cloud/routes';
import { conditional } from '@silverhand/essentials';
import { useCallback, useContext, useEffect, useState } from 'react';
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
};

/**
 * Fetches one page of hosted-email logs for the current tenant (Cloud only). The endpoint is
 * cursor-paginated (no total count), so paging is a cursor stack: `next` pushes the server's
 * `nextCursor`, `previous` pops back to the prior page, and any window change resets to the
 * first page.
 */
const useEmailLogs = ({ startTime, endTime, recipient }: Props) => {
  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi<typeof emailLogsRouter>({ hideErrorToast: true });
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const cursor = cursorStack.at(-1);

  useEffect(() => {
    setCursorStack([]);
  }, [startTime, endTime, recipient]);

  const { data, error, mutate } = useSWR<TenantEmailLogsResponse, unknown>(
    conditional(
      currentTenantId && [
        'email-logs',
        currentTenantId,
        startTime,
        endTime,
        recipient ?? '',
        cursor ?? '',
      ]
    ),
    async () =>
      cloudApi.get('/api/tenants/:tenantId/email-logs', {
        params: { tenantId: currentTenantId },
        search: buildEmailLogsSearch({ startTime, endTime, recipient, cursor }),
      })
  );

  const nextCursor = data?.nextCursor ?? undefined;

  const next = useCallback(() => {
    if (nextCursor) {
      setCursorStack((stack) => [...stack, nextCursor]);
    }
  }, [nextCursor]);

  const previous = useCallback(() => {
    setCursorStack((stack) => stack.slice(0, -1));
  }, []);

  return {
    logs: data?.logs,
    error,
    // Loading only while the fetch is actually enabled — with no tenant id the key is null and
    // SWR never fires, which would otherwise read as loading forever.
    isLoading: Boolean(currentTenantId) && !data && !error,
    mutate,
    hasNext: Boolean(nextCursor),
    hasPrevious: cursorStack.length > 0,
    next,
    previous,
  };
};

export default useEmailLogs;
