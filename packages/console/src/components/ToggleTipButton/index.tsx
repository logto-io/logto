import classNames from 'classnames';
import type { ReactElement } from 'react';
import { useRef, useState } from 'react';

import Tip from '@/assets/images/tip.svg';
import type { HorizontalAlignment } from '@/hooks/use-position';
import { onKeyDownHandler } from '@/utilities/a11y';

import type { TipBubblePosition } from '../TipBubble';
import ToggleTip from '../ToggleTip';
import * as styles from './index.module.scss';

type Props = {
  render: (closeTipHandler: () => void) => ReactElement;
  className?: string;
  tipPosition?: TipBubblePosition;
  tipHorizontalAlignment?: HorizontalAlignment;
};

const ToggleTipButton = ({ render, className, tipPosition, tipHorizontalAlignment }: Props) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isTipOpen, setIsTipOpen] = useState(false);

  const closeTipHandler = () => {
    setIsTipOpen(false);
  };

  return (
    <div className={classNames(styles.toggleTipButton, className)}>
      <div
        ref={anchorRef}
        role="tab"
        tabIndex={0}
        className={styles.icon}
        onClick={() => {
          setIsTipOpen(true);
        }}
        onKeyDown={onKeyDownHandler(() => {
          setIsTipOpen(true);
        })}
      >
        <Tip />
      </div>
      <ToggleTip
        isOpen={isTipOpen}
        anchorRef={anchorRef}
        position={tipPosition}
        horizontalAlign={tipHorizontalAlignment}
        onClose={() => {
          setIsTipOpen(false);
        }}
      >
        {render(closeTipHandler)}
      </ToggleTip>
    </div>
  );
};

export default ToggleTipButton;
