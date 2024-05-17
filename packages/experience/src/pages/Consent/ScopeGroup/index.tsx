import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useState, useCallback } from 'react';

import DownArrowIcon from '@/assets/icons/arrow-down.svg';
import CheckMark from '@/assets/icons/check-mark.svg';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type ScopeGroupProps = {
  readonly groupName: string;
  readonly isAutoExpand?: boolean;
  readonly scopes: Array<{
    id: string;
    name: string;
    description?: Nullable<string>; // Organization scope description cloud be `null`
  }>;
};

const ScopeGroup = ({ groupName, scopes, isAutoExpand = false }: ScopeGroupProps) => {
  const [expanded, setExpanded] = useState(isAutoExpand);

  const toggle = useCallback(() => {
    setExpanded((previous) => !previous);
  }, []);

  return (
    <div className={classNames(styles.scopeGroup)}>
      <div
        className={styles.scopeGroupHeader}
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={onKeyDownHandler(toggle)}
      >
        <CheckMark className={styles.check} />
        <div className={styles.scopeGroupName}>{groupName}</div>
        <DownArrowIcon className={styles.toggleButton} data-expanded={expanded} />
      </div>
      {expanded && (
        <ul className={styles.scopesList}>
          {scopes.map(({ id, name, description }) => (
            <li key={id} className={styles.scopeItem}>
              {description ?? name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScopeGroup;
