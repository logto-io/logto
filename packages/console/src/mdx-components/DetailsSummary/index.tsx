import classNames from 'classnames';
import { ReactNode, useState } from 'react';
import AnimateHeight, { Height } from 'react-animate-height';

import ArrowRight from '@/assets/images/triangle-right.svg';

import * as styles from './index.module.scss';

type Props = {
  children?: ReactNode[] | ReactNode;
};

const DetailsSummary = ({ children }: Props) => {
  const [summary, details] = Array.isArray(children) ? children : [children];
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<Height>(0);

  return (
    <div className={classNames(styles.container, isExpanded && styles.expanded)}>
      <div
        className={styles.summary}
        onClick={() => {
          setIsExpanded(!isExpanded);
          setHeight(height === 0 ? 'auto' : 0);
        }}
      >
        <ArrowRight className={styles.arrow} />
        {summary}
      </div>
      <AnimateHeight animateOpacity duration={300} height={height}>
        <div className={styles.details}>{details}</div>
      </AnimateHeight>
    </div>
  );
};

export default DetailsSummary;
