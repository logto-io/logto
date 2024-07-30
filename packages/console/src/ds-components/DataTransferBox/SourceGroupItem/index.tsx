import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CaretExpanded from '@/assets/icons/caret-expanded.svg?react';
import CaretFolded from '@/assets/icons/caret-folded.svg?react';
import Checkbox from '@/ds-components/Checkbox';
import IconButton from '@/ds-components/IconButton';
import { onKeyDownHandler } from '@/utils/a11y';

import SourceDataItem from '../SourceDataItem';
import { type DataEntry, type DataGroup, type SelectedDataEntry } from '../type';

import styles from './index.module.scss';

type Props<TEntry extends DataEntry> = {
  readonly dataGroup: DataGroup<TEntry>;
  readonly selectedGroupDataList: Array<SelectedDataEntry<TEntry>>;
  readonly onSelectDataGroup: (group: DataGroup<TEntry>) => void;
  readonly onSelectData: (data: TEntry) => void;
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
}: Props<TEntry>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { groupName, groupId, dataList } = dataGroup;
  const selectedDataIdSet = new Set(selectedGroupDataList.map(({ id }) => id));
  const selectedCount = selectedDataIdSet.size;
  const totalCount = dataList.length;

  const [isDataListHidden, setIsDataListHidden] = useState(true);

  return (
    <div className={styles.groupItem}>
      <div className={styles.title}>
        <Checkbox
          checked={selectedCount === totalCount}
          indeterminate={selectedCount > 0 && selectedCount < totalCount}
          onChange={() => {
            onSelectDataGroup(dataGroup);
          }}
        />
        <div
          role="button"
          tabIndex={0}
          className={styles.group}
          onKeyDown={onKeyDownHandler(() => {
            setIsDataListHidden(!isDataListHidden);
          })}
          onClick={() => {
            setIsDataListHidden(!isDataListHidden);
          }}
        >
          <IconButton size="medium" className={styles.caret}>
            {isDataListHidden ? <CaretFolded /> : <CaretExpanded />}
          </IconButton>
          <div className={styles.name}>{groupName}</div>
          <div className={styles.dataInfo}>
            ({t('role_details.permission.api_permission_count', { count: dataList.length })})
          </div>
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
