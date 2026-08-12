import { type Application } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { defaultPageSize } from '@/consts';
import { type RequestError } from '@/hooks/use-api';
import useDynamicApp from '@/hooks/use-dynamic-app';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import { dynamicAppRow, type ApplicationListRow } from '@/types/applications';
import { buildUrl } from '@/utils/url';

import { shouldListDynamicApp } from '../utils';

const pageSize = defaultPageSize;
const applicationsEndpoint = 'api/applications';

/**
 * @typeof {Object} ApplicationData
 *
 * @property data - The application data of the current active tab, returned from useSWR.
 * @property error - The request error of the current active tab returned from useSWR.
 * @property mutate - The mutate function of the current active tab returned from useSWR.
 * @property pagination - The pagination data of the current active tab. It contains the current page and page size.
 * @property paginationRecords - Returns the global pagination records of the first party and third party applications.
 *    This is used to keep track of the pagination when switching between tabs by passing the page records to the tab navigation.
 * @property updatePagination - The function to update the pagination of the current active tab.
 */

/**
 * This hook is used to keep track of the first party and third party applications data with pagination.
 *
 * @param isThirdParty
 * @returns {ApplicationData}
 */

const useApplicationsData = (isThirdParty = false) => {
  const [{ page }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
  });

  const [firstPartyApplicationPage, setFirstPartyApplicationPage] = useState(
    isThirdParty ? 1 : page
  );

  const [thirdPartyApplicationPage, setThirdPartyApplicationPage] = useState(
    isThirdParty ? page : 1
  );

  const updatePagination = useCallback(
    (page: number) => {
      updateSearchParameters({ page });
    },
    [updateSearchParameters]
  );

  useEffect(() => {
    // Update the pagination records based on the current active tab.
    if (isThirdParty) {
      setThirdPartyApplicationPage(page);
    } else {
      setFirstPartyApplicationPage(page);
    }
  }, [page, isThirdParty]);

  const firstPartyApplicationsFetchUrl = useMemo(
    () =>
      buildUrl(applicationsEndpoint, {
        page: String(firstPartyApplicationPage),
        page_size: String(pageSize),
        isThirdParty: 'false',
      }),
    [firstPartyApplicationPage]
  );

  const thirdPartyApplicationsFetchUrl = useMemo(
    () =>
      buildUrl(applicationsEndpoint, {
        page: String(thirdPartyApplicationPage),
        page_size: String(pageSize),
        isThirdParty: 'true',
      }),
    [thirdPartyApplicationPage]
  );

  const firstPartyApplicationsData = useSWR<[Application[], number], RequestError>(
    firstPartyApplicationsFetchUrl
  );

  const thirdPartyApplicationsData = useSWR<[Application[], number], RequestError>(
    thirdPartyApplicationsFetchUrl
  );

  const { data, ...applicationsData } = isThirdParty
    ? thirdPartyApplicationsData
    : firstPartyApplicationsData;

  const currentPage = isThirdParty ? thirdPartyApplicationPage : firstPartyApplicationPage;
  const { enabled: isDynamicAppEnabled } = useDynamicApp(isThirdParty);
  /** The dynamic app is not part of the total count, it is prepended to the listed page. */
  const hasDynamicAppRow = shouldListDynamicApp({
    isThirdPartyTab: isThirdParty,
    isDynamicAppEnabled,
    page: currentPage,
  });

  const rows = useMemo((): Optional<[ApplicationListRow[], number]> => {
    if (!data) {
      return;
    }

    const [applications, totalCount] = data;

    return [hasDynamicAppRow ? [dynamicAppRow, ...applications] : applications, totalCount];
  }, [data, hasDynamicAppRow]);

  return {
    ...applicationsData,
    data: rows,
    pagination: {
      page: isThirdParty ? thirdPartyApplicationPage : firstPartyApplicationPage,
      pageSize,
    },
    paginationRecords: {
      firstPartyApplicationPage,
      thirdPartyApplicationPage,
    },
    updatePagination,
  };
};

export default useApplicationsData;
