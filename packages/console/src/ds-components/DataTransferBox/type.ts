export type DataEntry = {
  id: string;
  name: string;
};

export type DataGroup<T extends DataEntry> = {
  groupId: string;
  groupName: string;
  dataList: T[];
};

type DataWithGroupInfo<T extends DataEntry> = T & {
  groupId: string;
  groupName: string;
};

export type SelectedDataEntry<T extends DataEntry> = T | DataWithGroupInfo<T>;
