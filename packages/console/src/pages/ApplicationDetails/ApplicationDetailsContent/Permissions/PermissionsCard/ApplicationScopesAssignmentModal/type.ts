import { type AdminConsoleKey } from '@logto/phrases';
import {
  type JsonObject,
  type ApplicationUserConsentScopesResponse,
  type ApplicationUserConsentScopeType,
} from '@logto/schemas';

import { type Props as DataTransferBoxProps } from '@/ds-components/DataTransferBox';
import { type DataEntry } from '@/ds-components/DataTransferBox/type';

type DataTransferBoxComponentProps<V extends DataEntry> = Pick<
  DataTransferBoxProps<V>,
  'selectedData' | 'setSelectedData' | 'availableDataList' | 'availableDataGroups' | 'title'
>;

type ScopeAssignmentHookReturnType<
  T extends ApplicationUserConsentScopeType,
  V extends DataEntry,
> = {
  scopeType: T;
} & DataTransferBoxComponentProps<V>;

// This is used to parse the ApplicationUserConsentScopeType to the response key
type CamelCase<T> = T extends `${infer A}-${infer B}` ? `${A}${Capitalize<CamelCase<B>>}` : T;

export type ScopeAssignmentHook<
  T extends ApplicationUserConsentScopeType,
  V extends DataEntry = DataEntry,
  U extends JsonObject = JsonObject,
> = (
  assignedScopes?: ApplicationUserConsentScopesResponse[CamelCase<T>],
  options?: U
) => ScopeAssignmentHookReturnType<T, V>;

export enum ScopeLevel {
  User = 'user',
  Organization = 'organization',
}

export type PermissionTabType = Partial<{
  [Key in ApplicationUserConsentScopeType]: {
    title: AdminConsoleKey;
    key: Key;
  };
}>;
