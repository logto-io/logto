/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Nullable } from '@silverhand/essentials';
import React, { useState, isValidElement, type ReactElement, cloneElement } from 'react';

import type { Props as TabItemProps } from '../TabItem';

type Props = {
  className?: string;
  children: ReactElement<TabItemProps>;
};

// A very rough duck type, but good enough to guard against mistakes while
// allowing customization
function isTabItem(comp: ReactElement): comp is ReactElement<TabItemProps> {
  return typeof comp.props.value !== 'undefined';
}

const Tabs = ({ className, children }: Props): JSX.Element => {
  const verifiedChildren = React.Children.map(children, (child) => {
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

  const [selectedValue, setSelectedValue] = useState<string>();
  const tabReferences: Array<Nullable<HTMLLIElement>> = [];

  const handleTabChange = (
    event: React.FocusEvent<HTMLLIElement> | React.MouseEvent<HTMLLIElement>
  ) => {
    const newTab = event.currentTarget;
    const newTabIndex = tabReferences.indexOf(newTab);
    const newTabValue = values[newTabIndex]?.value;

    if (newTabValue !== selectedValue) {
      setSelectedValue(newTabValue);
    }
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let focusElement: Nullable<HTMLLIElement> = null;

    switch (event.key) {
      case 'ArrowRight': {
        const nextTab = tabReferences.indexOf(event.currentTarget) + 1;
        // eslint-disable-next-line @silverhand/fp/no-mutation
        focusElement = tabReferences[nextTab] ?? tabReferences[0] ?? null;
        break;
      }

      case 'ArrowLeft': {
        const previousTab = tabReferences.indexOf(event.currentTarget) - 1;
        // eslint-disable-next-line @silverhand/fp/no-mutation
        focusElement =
          tabReferences[previousTab] ?? tabReferences[tabReferences.length - 1] ?? null;
        break;
      }
      default:
        break;
    }

    focusElement?.focus();
  };

  return (
    <div>
      <ul role="tablist" aria-orientation="horizontal" className={className}>
        {values.map(({ value, label }) => (
          <li
            key={value}
            ref={(tabControl) => tabReferences.concat(tabControl)}
            role="tab"
            tabIndex={selectedValue === value ? 0 : -1}
            aria-selected={selectedValue === value}
            onKeyDown={handleKeydown}
            onFocus={handleTabChange}
            onClick={handleTabChange}
          >
            {label ?? value}
          </li>
        ))}
      </ul>
      <div>
        {verifiedChildren.map((tabItem) =>
          cloneElement(tabItem, {
            key: tabItem.props.value,
          })
        )}
      </div>
    </div>
  );
};

export default Tabs;
