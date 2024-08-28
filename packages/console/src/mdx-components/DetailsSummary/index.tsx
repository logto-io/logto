import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import type { Height } from 'react-animate-height';
import AnimateHeight from 'react-animate-height';

import ArrowRight from '@/assets/icons/triangle-right.svg';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props = {
  readonly children?: ReactNode[] | ReactNode;
};

function DetailsSummary({ children }: Props) {
  const [summary, details] = Array.isArray(children) ? children : [children];
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<Height>(0);

  const onClickHandler = useCallback(() => {
    setIsExpanded(!isExpanded);
    setHeight(height === 0 ? 'auto' : 0);
  }, [height, isExpanded]);

  return (
    <div className={classNames(styles.container, isExpanded && styles.expanded)}>
      <div
        role="button"
        tabIndex={0}
        className={styles.summary}
        onKeyDown={onKeyDownHandler({
          Esc: () => {
            setIsExpanded(false);
            setHeight(0);
          },
          Enter: onClickHandler,
          ' ': onClickHandler,
        })}
        onClick={onClickHandler}
      >
        <ArrowRight className={styles.arrow} />
        {summary}
      </div>
      <AnimateHeight animateOpacity duration={300} height={height}>
        <div className={styles.details}>{details}</div>
      </AnimateHeight>
    </div>
  );
}

export default DetailsSummary;
