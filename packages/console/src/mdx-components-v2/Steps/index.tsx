import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { useRef, type ReactElement, useEffect, useState, useMemo, useContext } from 'react';

import useScroll from '@/hooks/use-scroll';
import { GuideContext } from '@/pages/Applications/components/Guide';

import Sample from '../Sample';
import { type Props as StepProps } from '../Step';
import type Step from '../Step';

import FurtherReadings from './FurtherReadings';
import * as styles from './index.module.scss';

type Props = {
  children: Array<ReactElement<StepProps, typeof Step>> | ReactElement<StepProps, typeof Step>;
};

/** Find the first scrollable element in the parent chain. */
const findScrollableElement = (element: Nullable<HTMLElement>): Nullable<HTMLElement> => {
  if (!element) {
    return null;
  }

  const { overflowY } = window.getComputedStyle(element);

  if (overflowY === 'auto' || overflowY === 'scroll') {
    return element;
  }

  return findScrollableElement(element.parentElement);
};

export default function Steps({ children: reactChildren }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const stepReferences = useRef<Array<Nullable<HTMLElement>>>([]);
  const { scrollTop } = useScroll(findScrollableElement(contentRef.current));
  const [activeIndex, setActiveIndex] = useState(-1);
  const furtherReadings = useMemo(
    () => <FurtherReadings title="Further readings" subtitle="4 articles" />,
    []
  );
  const children: Array<ReactElement<StepProps, typeof Step>> = useMemo(
    () =>
      Array.isArray(reactChildren)
        ? reactChildren.concat(furtherReadings)
        : [reactChildren, furtherReadings],
    [furtherReadings, reactChildren]
  );
  const { isCompact } = useContext(GuideContext);

  useEffect(() => {
    // Make sure the step references length matches the number of children.
    // eslint-disable-next-line @silverhand/fp/no-mutation
    stepReferences.current = stepReferences.current.slice(0, children.length);
  }, [children]);

  useEffect(() => {
    // Get the active index by comparing the scroll position of the content
    // with the top of each step in reverse order because the last satisfied
    // step is the active one.
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    const reversedActiveIndex = stepReferences.current
      .slice()
      .reverse()
      .findIndex((stepRef) => {
        if (!stepRef) {
          return false;
        }

        const elementScrollTop = stepRef.getBoundingClientRect().top;
        // Don't try to understand it, feel it.
        return elementScrollTop <= 280;
      });

    setActiveIndex(reversedActiveIndex === -1 ? -1 : children.length - reversedActiveIndex - 1);
  }, [children.length, scrollTop]);

  return (
    <div className={classNames(styles.wrapper, isCompact && styles.fullWidth)}>
      {!isCompact && (
        <div className={styles.navigationAnchor}>
          <nav className={styles.navigation}>
            {children.map((component, index) => (
              <div
                key={component.props.title}
                className={classNames(styles.stepper, index === activeIndex && styles.active)}
              >
                {index + 1}. {component.props.title}
              </div>
            ))}
          </nav>
        </div>
      )}
      <div ref={contentRef} className={styles.content}>
        <Sample />
        {children.map((component, index) =>
          React.cloneElement(component, {
            key: component.props.title,
            index,
            ref: (element: HTMLDivElement) => {
              // eslint-disable-next-line @silverhand/fp/no-mutation
              stepReferences.current[index] = element;
            },
          })
        )}
      </div>
    </div>
  );
}
