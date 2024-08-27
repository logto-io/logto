import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { useRef, type ReactElement, useEffect, useState, useMemo, useContext } from 'react';

import { GuideContext } from '@/components/Guide';
import useScroll from '@/hooks/use-scroll';
import { onKeyDownHandler } from '@/utils/a11y';

import Sample from '../Sample';
import { type Props as StepProps } from '../Step';
import Step from '../Step';

import FurtherReadings from './FurtherReadings';
import styles from './index.module.scss';

type Props = {
  readonly children:
    | Array<ReactElement<StepProps, typeof Step>>
    | ReactElement<StepProps, typeof Step>;
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
  const { isCompact, metadata } = useContext(GuideContext);
  const isApiResourceGuide = metadata.target === 'API';

  const furtherReadings = useMemo(
    () => (
      <FurtherReadings
        title="Further readings"
        fullGuide={metadata.fullGuide}
        furtherReadings={metadata.furtherReadings}
      />
    ),
    [metadata.fullGuide, metadata.furtherReadings]
  );
  const children: Array<ReactElement<StepProps, typeof Step>> = useMemo(() => {
    const steps = (Array.isArray(reactChildren) ? reactChildren : [reactChildren]).filter(
      (child) => child.type === Step
    );

    return isApiResourceGuide ? steps : steps.concat(furtherReadings);
  }, [isApiResourceGuide, furtherReadings, reactChildren]);

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

  const navigateToStep = (index: number) => {
    const stepRef = stepReferences.current[index];
    if (stepRef) {
      stepRef.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div ref={contentRef} className={classNames(styles.content, isCompact && styles.compact)}>
        {!isCompact && (
          <div className={styles.navigationAnchor}>
            <nav className={styles.navigation}>
              {children.map((component, index) => (
                <div
                  key={component.props.title}
                  role="button"
                  tabIndex={0}
                  className={classNames(styles.stepper, index === activeIndex && styles.active)}
                  onKeyDown={onKeyDownHandler(() => {
                    navigateToStep(index);
                  })}
                  onClick={() => {
                    navigateToStep(index);
                  }}
                >
                  {index + 1}. {component.props.title}
                </div>
              ))}
            </nav>
          </div>
        )}
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
