import classNames from 'classnames';

import * as transferLayout from '@/scss/transfer.module.scss';

import SourceScopesBox from '../SourceScopesBox';
import TargetScopesBox from '../TargetScopesBox';
import {
  type ScopeAssignmentScopeDataType,
  type ScopeAssignmentResourceScopesGroupDataType,
  type SelectedScopeAssignmentScopeDataType,
} from '../type';

import * as styles from './index.module.scss';

type Props = {
  selectedScopes: SelectedScopeAssignmentScopeDataType[];
  setSelectedScopes: (scopes: SelectedScopeAssignmentScopeDataType[]) => void;
  availableScopes?: ScopeAssignmentScopeDataType[];
  groupedAvailableResourceScopes?: ScopeAssignmentResourceScopesGroupDataType[];
};

function ScopesAssignmentForm({
  selectedScopes,
  setSelectedScopes,
  availableScopes,
  groupedAvailableResourceScopes,
}: Props) {
  return (
    <div className={classNames(transferLayout.container, styles.scopesAssignmentForm)}>
      <SourceScopesBox
        {...{ selectedScopes, setSelectedScopes, availableScopes, groupedAvailableResourceScopes }}
      />
      <div className={transferLayout.verticalBar} />
      <TargetScopesBox {...{ selectedScopes, setSelectedScopes }} />
    </div>
  );
}

export default ScopesAssignmentForm;
