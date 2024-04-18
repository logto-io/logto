/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Nullable } from '@silverhand/essentials';
import { useState, isValidElement, type ReactElement, cloneElement, useRef, Children } from 'react';

import type { Props as TabItemProps } from '../TabItem';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly children: ReactElement<TabItemProps>;
};

// A very rough duck type, but good enough to guard against mistakes while
// allowing customization
function isTabItem(comp: ReactElement): comp is ReactElement<TabItemProps> {
  return comp.props.value !== undefined;
}

function Tabs({ className, children }: Props): JSX.Element {
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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabReferences = useRef<Array<Nullable<HTMLLIElement>>>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    Array.from<null>({ length }).fill(null)
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
      <ul role="tablist" aria-orientation="horizontal" className={className}>
        {values.map(({ value, label }, index) => (
          <li
            key={value}
            ref={(element) => {
              // eslint-disable-next-line @silverhand/fp/no-mutation
              tabReferences.current[index] = element;
            }}
            role="tab"
            tabIndex={selectedIndex === index ? 0 : -1}
            aria-selected={selectedIndex === index}
            onKeyDown={handleKeydown}
            onFocus={() => {
              setSelectedIndex(index);
            }}
            onClick={() => {
              setSelectedIndex(index);
            }}
          >
            {label ?? value}
          </li>
        ))}
      </ul>
      <div>
        {verifiedChildren.map((tabItem, index) =>
          cloneElement(tabItem, {
            key: tabItem.props.value,
            className: index === selectedIndex ? undefined : styles.hidden,
          })
        )}
      </div>
    </div>
  );
}

export default Tabs;
