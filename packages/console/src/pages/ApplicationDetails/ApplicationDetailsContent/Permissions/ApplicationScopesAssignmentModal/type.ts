import {
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
> = (
  assignedScopes?: ApplicationUserConsentScopesResponse[CamelCase<T>]
) => ScopeAssignmentHookReturnType<T, V>;
