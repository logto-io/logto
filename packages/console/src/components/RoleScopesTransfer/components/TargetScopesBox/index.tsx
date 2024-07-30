import type { ScopeResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import transferLayout from '@/scss/transfer.module.scss';

import TargetScopeItem from '../TargetScopeItem';

import styles from './index.module.scss';

type Props = {
  readonly selectedScopes: ScopeResponse[];
  readonly onChange: (value: ScopeResponse[]) => void;
};

function TargetScopesBox({ selectedScopes, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <span className={styles.added}>
          {t('role_details.permission.added_text', { count: selectedScopes.length })}
        </span>
      </div>
      <div className={transferLayout.boxContent}>
        {selectedScopes.map((scope) => (
          <TargetScopeItem
            key={scope.id}
            scope={scope}
            onDelete={(scope) => {
              onChange(selectedScopes.filter(({ id }) => id !== scope.id));
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default TargetScopesBox;
