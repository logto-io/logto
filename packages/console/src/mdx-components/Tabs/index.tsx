/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import {
  useState,
  isValidElement,
  type ReactElement,
  cloneElement,
  useRef,
  useEffect,
  Children,
} from 'react';

import type { Props as TabItemProps } from '../TabItem';

import styles from './index.module.scss';
import useTabGroupChoice from './use-tab-group-choice';

type MaybeArray<T> = T | T[];

type Props = {
  readonly className?: string;
  /**
   * Tab groups sharing the same `groupId` stay in sync and remember the selected
   * value across visits. Useful when the same choice (e.g. an SDK version) is
   * repeated across a guide.
   */
  readonly groupId?: string;
  readonly children: MaybeArray<ReactElement<TabItemProps>>;
};

// A very rough duck type, but good enough to guard against mistakes while
// allowing customization
function isTabItem(comp: ReactElement): comp is ReactElement<TabItemProps> {
  return comp.props.value !== undefined;
}

function Tabs({ className, groupId, children }: Props): JSX.Element {
  const verifiedChildren = Children.map(children, (child) => {
    if (isValidElement(child) && isTabItem(child)) {
      return child;
    }
  });

  const values =
    // Only pick keys that we recognize. MDX would inject some keys by default
    verifiedChildren.map(({ props: { value, label } }) => ({
      value,
      label,
    }));

  const [groupChoice, setGroupChoice] = useTabGroupChoice(groupId);
  const isValidValue = (value: Nullable<string>) =>
    values.some((tabValue) => tabValue.value === value);

  // Selection is tracked by value (instead of index) so synced groups can share
  // the same choice even when their tabs are declared in a different order.
  const [selectedValue, setSelectedValue] = useState(() =>
    isValidValue(groupChoice) ? groupChoice : values[0]?.value
  );

  // Sync the persisted choice (changed by another tab group) into local state.
  useEffect(() => {
    if (isValidValue(groupChoice) && groupChoice !== selectedValue) {
      setSelectedValue(groupChoice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to external choice changes
  }, [groupChoice]);

  const selectValue = (value: string) => {
    setSelectedValue(value);
    setGroupChoice(value);
  };

  const tabReferences = useRef<Array<Nullable<HTMLLIElement>>>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    Array.from<null>({ length: values.length }).fill(null)
  );

  const handleKeydown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let focusElement: Nullable<HTMLLIElement> = null;

    switch (event.key) {
      case 'ArrowRight': {
        const nextTab = tabReferences.current.indexOf(event.currentTarget) + 1;
        // eslint-disable-next-line @silverhand/fp/no-mutation
        focusElement = tabReferences.current[nextTab] ?? tabReferences.current[0] ?? null;
        break;
      }

      case 'ArrowLeft': {
        const previousTab = tabReferences.current.indexOf(event.currentTarget) - 1;
        // eslint-disable-next-line @silverhand/fp/no-mutation
        focusElement = tabReferences.current[previousTab] ?? tabReferences.current.at(-1) ?? null;
        break;
      }

      default: {
        break;
      }
    }

    focusElement?.focus();
  };

  return (
    <div className={styles.container}>
      <ul
        role="tablist"
        aria-orientation="horizontal"
        className={classNames(styles.tabItemList, className)}
      >
        {values.map(({ value, label }, index) => (
          <li
            key={value}
            ref={(element) => {
              // eslint-disable-next-line @silverhand/fp/no-mutation
              tabReferences.current[index] = element;
            }}
            role="tab"
            tabIndex={selectedValue === value ? 0 : -1}
            aria-selected={selectedValue === value}
            onKeyDown={handleKeydown}
            onFocus={() => {
              selectValue(value);
            }}
            onClick={() => {
              selectValue(value);
            }}
          >
            {label ?? value}
          </li>
        ))}
      </ul>
      <div>
        {verifiedChildren.map((tabItem) =>
          cloneElement(tabItem, {
            key: tabItem.props.value,
            className: tabItem.props.value === selectedValue ? undefined : styles.hidden,
          })
        )}
      </div>
    </div>
  );
}

export default Tabs;
