import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useRef } from 'react';

import { Tooltip } from '@/ds-components/Tip';
import useTextOverflow from '@/hooks/use-text-overflow';

import * as styles from './index.module.scss';

type Props = {
  children: string;
};

function HoverableTextWrapper({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { isTextOverflow } = useTextOverflow(ref);

  return (
    <Tooltip
      content={conditional(isTextOverflow && children)}
      anchorClassName={styles.tooltipAnchor}
    >
      <div ref={ref} className={classNames(styles.text)}>
        {children}
      </div>
    </Tooltip>
  );
}

export default HoverableTextWrapper;
