import classNames from 'classnames';
import { useState, type ChangeEvent, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Search from '@/assets/icons/search.svg?react';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import Pagination, { type Props as PaginationProps } from '@/ds-components/Pagination';
import TextInput from '@/ds-components/TextInput';
import useDebounce from '@/hooks/use-debounce';
import transferLayout from '@/scss/transfer.module.scss';

import SourceDataItem from '../SourceDataItem';
import SourceGroupItem from '../SourceGroupItem';
import { type DataEntry, type DataGroup, type SelectedDataEntry } from '../type';

import styles from './index.module.scss';

const appendUnique = <T extends DataEntry>(list: T[], items: T | T[]) => {
  const newEntries = Array.isArray(items) ? items : [items];

  return [...list, ...newEntries.filter((item) => list.every(({ id }) => id !== item.id))];
};

type Props<TEntry extends DataEntry> = {
  readonly selectedData: Array<SelectedDataEntry<TEntry>>;
  readonly setSelectedData: (dataList: Array<SelectedDataEntry<TEntry>>) => void;
  readonly availableDataList?: TEntry[];
  readonly availableDataGroups?: Array<DataGroup<TEntry>>;
  readonly isSourceLoading?: boolean;
  readonly sourcePagination?: Omit<PaginationProps, 'className' | 'mode'>;
  readonly onSourceSearch?: (keyword: string) => void;
  readonly onExpandDataGroup?: (group: DataGroup<TEntry>) => void;
};

const skeletonRowCount = 6;

function SourcePanel<TEntry extends DataEntry>({
  selectedData,
  setSelectedData,
  availableDataList,
  availableDataGroups,
  isSourceLoading = false,
  sourcePagination,
  onSourceSearch,
  onExpandDataGroup,
}: Props<TEntry>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const debounce = useDebounce();

  // Keyword search
  const [keyword, setKeyword] = useState('');

  const handleSearchInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setKeyword(value);

      if (onSourceSearch) {
        debounce(() => {
          onSourceSearch(value);
        });
      }
    },
    [debounce, onSourceSearch]
  );

  const isDataEntrySelected = useCallback(
    (data: TEntry) => selectedData.findIndex(({ id }) => id === data.id) >= 0,
    [selectedData]
  );

  // Get all the selected data by group
  const getSelectedDataInGroup = useCallback(
    ({ dataList }: DataGroup<TEntry>) =>
      selectedData.filter(({ id }) => dataList.some((data) => data.id === id)),
    [selectedData]
  );

  // Toggle the data Entry selection status
  const onSelectData = useCallback(
    (data: SelectedDataEntry<TEntry>) => {
      if (isDataEntrySelected(data)) {
        setSelectedData(selectedData.filter(({ id }) => id !== data.id));
        return;
      }

      setSelectedData(appendUnique(selectedData, data));
    },
    [isDataEntrySelected, selectedData, setSelectedData]
  );

  // Toggle the data group selection status
  const onSelectDataGroup = useCallback(
    ({ groupName, groupId, dataList }: DataGroup<TEntry>) => {
      const isAllSelected = dataList.every((data) => isDataEntrySelected(data));

      // If all the data entities in the group are selected, remove them from the selected data list
      if (isAllSelected) {
        setSelectedData(
          selectedData.filter(
            ({ id: selectedDataId }) =>
              !dataList.some(({ id: groupDataId }) => groupDataId === selectedDataId)
          )
        );
        return;
      }

      // Add all the data entities in the group to the selected data list
      setSelectedData(
        appendUnique(
          selectedData,
          dataList.map((data) => ({ ...data, groupName, groupId }))
        )
      );
    },
    [isDataEntrySelected, selectedData, setSelectedData]
  );

  // Get the keyword filtered available dataList
  const filteredAvailableDataList = useMemo(() => {
    if (!availableDataList) {
      return;
    }

    if (onSourceSearch) {
      return availableDataList;
    }

    const lowerCasedKeyword = keyword.toLowerCase();

    if (!lowerCasedKeyword) {
      return availableDataList;
    }

    return availableDataList.filter(({ name }) => name.toLowerCase().includes(lowerCasedKeyword));
  }, [availableDataList, keyword, onSourceSearch]);

  // Get the keyword filtered available dataGroups
  const filteredAvailableDataGroups = useMemo(() => {
    if (!availableDataGroups) {
      return;
    }

    if (onSourceSearch) {
      return availableDataGroups;
    }

    const lowerCasedKeyword = keyword.toLowerCase();

    if (!lowerCasedKeyword) {
      return availableDataGroups;
    }

    return (
      availableDataGroups
        .map((dataGroup) => {
          // If the group name matches the keyword, return all the data in the group
          if (dataGroup.groupName.toLowerCase().includes(lowerCasedKeyword)) {
            return dataGroup;
          }

          // If the group name doesn't match the keyword, return the dataEntry name filtered dataList
          return {
            ...dataGroup,
            dataList: dataGroup.dataList.filter(({ name }) =>
              lowerCasedKeyword ? name.toLowerCase().includes(lowerCasedKeyword) : true
            ),
          };
        })
        // Filter out the dataGroups if the group name doesn't match the keyword and none of the dataEntry name matches the keyword
        .filter(
          (dataGroup) =>
            dataGroup.groupName.toLowerCase().includes(lowerCasedKeyword) ||
            dataGroup.dataList.length > 0
        )
    );
  }, [availableDataGroups, keyword, onSourceSearch]);

  const isEmpty =
    !isSourceLoading && !filteredAvailableDataList?.length && !filteredAvailableDataGroups?.length;

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <TextInput
          className={styles.search}
          icon={<Search className={styles.icon} />}
          placeholder={t('general.search_placeholder')}
          onChange={handleSearchInput}
        />
      </div>
      <div
        className={classNames(transferLayout.boxContent, isEmpty && transferLayout.emptyBoxContent)}
      >
        {isSourceLoading ? (
          <div className={styles.skeletonList}>
            {Array.from({ length: skeletonRowCount }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key -- Static skeleton placeholders have no stable IDs.
              <div key={index} className={styles.skeletonRow}>
                <div className={styles.skeletonCheckbox} />
                <div className={styles.skeletonGroup}>
                  <div className={styles.skeletonIcon} />
                  <div className={styles.skeletonContent} />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyDataPlaceholder size="small" title={t('role_details.permission.empty')} />
        ) : (
          <>
            {filteredAvailableDataGroups?.map((dataGroup) => (
              <SourceGroupItem
                key={dataGroup.groupId}
                dataGroup={dataGroup}
                selectedGroupDataList={getSelectedDataInGroup(dataGroup)}
                onSelectData={onSelectData}
                onSelectDataGroup={onSelectDataGroup}
                onExpandDataGroup={onExpandDataGroup}
              />
            ))}
            {filteredAvailableDataList?.map((data) => (
              <SourceDataItem
                key={data.id}
                data={data}
                isSelected={isDataEntrySelected(data)}
                onSelect={onSelectData}
              />
            ))}
          </>
        )}
      </div>
      {sourcePagination && (
        <Pagination {...sourcePagination} mode="pico" className={transferLayout.boxPagination} />
      )}
    </div>
  );
}

export default SourcePanel;
