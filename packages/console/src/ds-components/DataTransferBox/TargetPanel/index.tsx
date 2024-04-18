import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import * as transferLayout from '@/scss/transfer.module.scss';

import TargetDataItem from '../TargetDataItem';
import { type DataEntry, type SelectedDataEntry } from '../type';

import * as styles from './index.module.scss';

type Props<TEntry extends DataEntry> = {
  readonly selectedData: Array<SelectedDataEntry<TEntry>>;
  readonly setSelectedData: (dataList: Array<SelectedDataEntry<TEntry>>) => void;
};

function TargetPanel<TEntry extends DataEntry>({ selectedData, setSelectedData }: Props<TEntry>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const onDelete = useCallback(
    ({ id }: TEntry) => {
      setSelectedData(selectedData.filter(({ id: selectedDataId }) => selectedDataId !== id));
    },
    [selectedData, setSelectedData]
  );

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <span className={styles.added}>
          {t('role_details.permission.added_text', { count: selectedData.length })}
        </span>
      </div>
      <div className={transferLayout.boxContent}>
        {selectedData.map((data) => (
          <TargetDataItem key={data.id} data={data} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

export default TargetPanel;
