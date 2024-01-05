import { type Application } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import { defaultPageSize } from '@/consts';
import { type RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import { buildUrl } from '@/utils/url';

const pageSize = defaultPageSize;
const applicationsEndpoint = 'api/applications';

/**
 * This hook is the forked version of useApplicationsData. @see {@link (./use-application-data.ts)}
 * But have all the third party application related request and code removed.
 * This will be applied directly on the current application page.
 * To prevent the third party api request and code from being triggered.
 *
 * We use the isDevFeatureEnabled to determine if we should use this legacy hook or the new one.
 * This hook will be removed once we have the third-party application feature ready for production.
 */
const useLegacyApplicationsData = () => {
  const [{ page }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
  });

  const updatePagination = useCallback(
    (page: number) => {
      updateSearchParameters({ page });
    },
    [updateSearchParameters]
  );

  const url = useMemo(
    () =>
      buildUrl(applicationsEndpoint, {
        page: String(page),
        page_size: String(pageSize),
      }),
    [page]
  );

  const data = useSWR<[Application[], number], RequestError>(url);

  return {
    ...data,
    pagination: {
      page,
      pageSize,
    },
    paginationRecords: {
      firstPartyApplicationPage: page,
      thirdPartyApplicationPage: page,
    },
    showThirdPartyApplicationTab: false,
    updatePagination,
  };
};

export default useLegacyApplicationsData;
