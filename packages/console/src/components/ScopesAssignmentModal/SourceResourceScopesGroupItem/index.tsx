import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CaretExpanded from '@/assets/icons/caret-expanded.svg';
import CaretFolded from '@/assets/icons/caret-folded.svg';
import Checkbox from '@/ds-components/Checkbox';
import IconButton from '@/ds-components/IconButton';
import { onKeyDownHandler } from '@/utils/a11y';

import SourceScopeItem from '../SourceScopeItem';
import {
  type ScopeAssignmentResourceScopesGroupDataType,
  type SelectedScopeAssignmentScopeDataType,
} from '../type';

import * as styles from './index.module.scss';

type Props = {
  resourceGroup: ScopeAssignmentResourceScopesGroupDataType;
  resourceSelectedScopes: SelectedScopeAssignmentScopeDataType[];
  onSelectResource: (resource: ScopeAssignmentResourceScopesGroupDataType) => void;
  onSelectScope: (scope: SelectedScopeAssignmentScopeDataType) => void;
};

function SourceResourceScopesGroupItem({
  resourceGroup,
  resourceSelectedScopes,
  onSelectResource,
  onSelectScope,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { resourceName, scopes } = resourceGroup;
  const selectedScopesIdsSet = new Set(resourceSelectedScopes.map(({ id }) => id));
  const selectedScopesCount = selectedScopesIdsSet.size;
  const totalScopesCount = scopes.length;

  const [isScopesInvisible, setIsScopesInvisible] = useState(true);

  return (
    <div className={styles.resourceItem}>
      <div className={styles.title}>
        <Checkbox
          checked={selectedScopesCount === totalScopesCount}
          indeterminate={selectedScopesCount > 0 && selectedScopesCount < totalScopesCount}
          onChange={() => {
            onSelectResource(resourceGroup);
          }}
        />
        <div
          role="button"
          tabIndex={0}
          className={styles.resource}
          onKeyDown={onKeyDownHandler(() => {
            setIsScopesInvisible(!isScopesInvisible);
          })}
          onClick={() => {
            setIsScopesInvisible(!isScopesInvisible);
          }}
        >
          <IconButton size="medium" className={styles.caret}>
            {isScopesInvisible ? <CaretFolded /> : <CaretExpanded />}
          </IconButton>
          <div className={styles.name}>{resourceName}</div>
          <div className={styles.scopeInfo}>
            ({t('role_details.permission.api_permission_count', { count: scopes.length })})
          </div>
        </div>
      </div>
      <div className={classNames(isScopesInvisible && styles.invisible, styles.scopesGroup)}>
        {scopes.map((scope) => (
          <SourceScopeItem
            key={scope.id}
            scope={scope}
            isSelected={selectedScopesIdsSet.has(scope.id)}
            onSelect={(scope) => {
              onSelectScope({
                ...scope,
                resourceName,
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SourceResourceScopesGroupItem;
