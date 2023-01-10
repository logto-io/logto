import type { ScopeResponse } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import TargetPermissionItem from './components/TargetPermissionItem';
import * as styles from './index.module.scss';

type Props = {
  selectedScopes: ScopeResponse[];
  onRemovePermission: (scope: ScopeResponse) => void;
};

const TargetPermissionsBox = ({ selectedScopes, onRemovePermission }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.box}>
      <div className={classNames(styles.top, styles.added)}>
        <span>{t('role_details.permission.added_text', { value: selectedScopes.length })}</span>
      </div>
      <div className={styles.content}>
        {selectedScopes.map((scope) => {
          return (
            <TargetPermissionItem
              key={scope.id}
              scope={scope}
              onDelete={() => {
                onRemovePermission(scope);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TargetPermissionsBox;
