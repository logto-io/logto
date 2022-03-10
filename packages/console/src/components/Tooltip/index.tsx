import { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { ReactNode, RefObject, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import * as styles from './index.module.scss';

type Props<T> = {
  content: ReactNode;
  domRef: RefObject<Nullable<T>>;
  className?: string;
  isAuto?: boolean;
};

type Position = {
  top: number;
  left: number;
};

const Tooltip = <T extends Element>({ content, domRef, className, isAuto = true }: Props<T>) => {
  const [tooltipDom, setTooltipDom] = useState<HTMLDivElement>();
  const [position, setPosition] = useState<Position>();
  const isVisible = position !== undefined;

  useEffect(() => {
    if (!domRef.current) {
      return;
    }

    const dom = domRef.current;

    if (!isAuto) {
      const { top, left, width } = domRef.current.getBoundingClientRect();
      const { scrollTop, scrollLeft } = document.documentElement;
      setPosition({ top: top + scrollTop - 12, left: left + scrollLeft + width / 2 });

      return;
    }

    const enterHandler = () => {
      if (domRef.current) {
        const { top, left, width } = domRef.current.getBoundingClientRect();
        const { scrollTop, scrollLeft } = document.documentElement;
        setPosition({ top: top + scrollTop - 12, left: left + scrollLeft + width / 2 });
      }
    };

    const leaveHandler = () => {
      setPosition(undefined);
    };

    dom.addEventListener('mouseenter', enterHandler);
    dom.addEventListener('mouseleave', leaveHandler);

    return () => {
      dom.removeEventListener('mouseenter', enterHandler);
      dom.removeEventListener('mouseleave', leaveHandler);
    };
  }, [domRef, isAuto]);

  useEffect(() => {
    if (!isVisible) {
      if (tooltipDom) {
        tooltipDom.remove();
        setTooltipDom(undefined);
      }

      return;
    }

    if (!tooltipDom) {
      const dom = document.createElement('div');
      document.body.append(dom);
      setTooltipDom(dom);
    }

    return () => tooltipDom?.remove();
  }, [isVisible, tooltipDom]);

  if (!tooltipDom || !position) {
    return null;
  }

  return createPortal(
    <div className={classNames(styles.container, className)} style={{ ...position }}>
      {content}
    </div>,
    tooltipDom
  );
};

export default Tooltip;
