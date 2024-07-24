import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { type ReactElement } from 'react';

import FormField from '@/ds-components/FormField';
import transferLayout from '@/scss/transfer.module.scss';

import type DangerousRaw from '../DangerousRaw';

import SourcePanel from './SourcePanel';
import TargetPanel from './TargetPanel';
import styles from './index.module.scss';
import { type DataEntry, type DataGroup, type SelectedDataEntry } from './type';

/**
 * DataTransferBox is a component that allows users to select data from a list of available data in a form of a list or a tree.
 *
 * @param title - The title of the TransferBox. It can be a string or a React element.
 * @param selectedData - The list of selected data.
 * @param setSelectedData - The callback function to set the selected data.
 * @param availableDataList - The list of available data. (List form)
 * @param availableDataGroups - The list of available data groups. (Single level tree form)
 */

export type Props<TEntry extends DataEntry> = {
  readonly title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  readonly selectedData: Array<SelectedDataEntry<TEntry>>;
  readonly setSelectedData: (dataList: Array<SelectedDataEntry<TEntry>>) => void;
  readonly availableDataList?: TEntry[];
  readonly availableDataGroups?: Array<DataGroup<TEntry>>;
  readonly className?: string;
  readonly containerClassName?: string;
};

function DataTransferBox<TEntry extends DataEntry = DataEntry>({
  title,
  selectedData,
  setSelectedData,
  availableDataList,
  availableDataGroups,
  className,
  containerClassName,
}: Props<TEntry>) {
  return (
    <FormField title={title} className={className}>
      <div
        className={classNames(transferLayout.container, styles.dataTransferBox, containerClassName)}
      >
        <SourcePanel
          {...{
            selectedData,
            setSelectedData,
            availableDataList,
            availableDataGroups,
          }}
        />
        <div className={transferLayout.verticalBar} />
        <TargetPanel {...{ selectedData, setSelectedData }} />
      </div>
    </FormField>
  );
}

export default DataTransferBox;
