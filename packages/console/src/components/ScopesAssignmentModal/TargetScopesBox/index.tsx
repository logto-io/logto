import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import * as transferLayout from '@/scss/transfer.module.scss';

import TargetScopeItem from '../TargetScopeItem';
import {
  type SelectedScopeAssignmentScopeDataType,
  type ScopeAssignmentScopeDataType,
} from '../type';

import * as styles from './index.module.scss';

type Props = {
  selectedScopes: SelectedScopeAssignmentScopeDataType[];
  setSelectedScopes: (scopes: SelectedScopeAssignmentScopeDataType[]) => void;
};

function TargetScopesBox({ selectedScopes, setSelectedScopes }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const onDeleteScope = useCallback(
    ({ id }: ScopeAssignmentScopeDataType) => {
      setSelectedScopes(selectedScopes.filter(({ id: scopeId }) => scopeId !== id));
    },
    [selectedScopes, setSelectedScopes]
  );

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <span className={styles.added}>
          {t('role_details.permission.added_text', { count: selectedScopes.length })}
        </span>
      </div>
      <div className={transferLayout.boxContent}>
        {selectedScopes.map((scope) => (
          <TargetScopeItem key={scope.id} scope={scope} onDelete={onDeleteScope} />
        ))}
      </div>
    </div>
  );
}

export default TargetScopesBox;
