import classNames from 'classnames';
import { useState } from 'react';

import CaretExpanded from '@/assets/icons/caret-expanded.svg?react';
import CaretFolded from '@/assets/icons/caret-folded.svg?react';
import Checkbox from '@/ds-components/Checkbox';
import IconButton from '@/ds-components/IconButton';
import { Ring as Spinner } from '@/ds-components/Spinner';
import { onKeyDownHandler } from '@/utils/a11y';

import SourceDataItem from '../SourceDataItem';
import { type DataEntry, type DataGroup, type SelectedDataEntry } from '../type';

import styles from './index.module.scss';

type Props<TEntry extends DataEntry> = {
  readonly dataGroup: DataGroup<TEntry>;
  readonly selectedGroupDataList: Array<SelectedDataEntry<TEntry>>;
  readonly onSelectDataGroup: (group: DataGroup<TEntry>) => void;
  readonly onSelectData: (data: SelectedDataEntry<TEntry>) => void;
  readonly onExpandDataGroup?: (group: DataGroup<TEntry>) => void;
};

/**
 * SourceGroupItem is a component that renders a group of data in the source panel.
 *
 * e.g. API resource scopes grouped under the same API resource.
 *
 * @param dataGroup - The data group to be rendered. e.g. resource with scopes
 * @param selectedGroupDataList - The list of selected data in the group.
 * @param onSelectDataGroup - The callback function to select the whole group.
 * @param onSelectData - The callback function to select a single data within the group.
 */
function SourceGroupItem<TEntry extends DataEntry>({
  dataGroup,
  selectedGroupDataList,
  onSelectDataGroup,
  onSelectData,
  onExpandDataGroup,
}: Props<TEntry>) {
  const { groupName, groupId, dataList, dataInfo, isLoading } = dataGroup;
  const selectedDataIdSet = new Set(selectedGroupDataList.map(({ id }) => id));
  const selectedCount = selectedDataIdSet.size;
  const totalCount = dataList.length;
  const isCheckboxDisabled = Boolean(isLoading) || totalCount === 0;

  const [isDataListHidden, setIsDataListHidden] = useState(true);
  const toggleDataListVisibility = () => {
    setIsDataListHidden((isHidden) => {
      if (isHidden) {
        onExpandDataGroup?.(dataGroup);
      }

      return !isHidden;
    });
  };

  return (
    <div className={styles.groupItem}>
      <div className={styles.title}>
        <Checkbox
          checked={totalCount > 0 && selectedCount === totalCount}
          indeterminate={selectedCount > 0 && selectedCount < totalCount}
          disabled={isCheckboxDisabled}
          onChange={() => {
            onSelectDataGroup(dataGroup);
          }}
        />
        <div
          role="button"
          tabIndex={0}
          className={styles.group}
          onKeyDown={onKeyDownHandler(toggleDataListVisibility)}
          onClick={toggleDataListVisibility}
        >
          <IconButton size="medium">
            {isLoading ? (
              <Spinner className={styles.spinner} />
            ) : isDataListHidden ? (
              <CaretFolded />
            ) : (
              <CaretExpanded />
            )}
          </IconButton>
          <div className={styles.name}>{groupName}</div>
          {dataInfo && <div className={styles.dataInfo}>{dataInfo}</div>}
        </div>
      </div>
      <div className={classNames(isDataListHidden && styles.invisible, styles.dataList)}>
        {dataList.map((data) => (
          <SourceDataItem
            key={data.id}
            data={data}
            isSelected={selectedDataIdSet.has(data.id)}
            onSelect={() => {
              onSelectData({
                ...data,
                groupName,
                groupId,
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SourceGroupItem;
