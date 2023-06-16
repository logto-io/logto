import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

import KeyboardArrowDown from '@/assets/icons/keyboard-arrow-down.svg';
import KeyboardArrowUp from '@/assets/icons/keyboard-arrow-up.svg';
import Index from '@/components/Index';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import CardTitle from '@/ds-components/CardTitle';
import DangerousRaw from '@/ds-components/DangerousRaw';
import IconButton from '@/ds-components/IconButton';
import Spacer from '@/ds-components/Spacer';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  index: number;
  activeIndex: number;
  buttonText?: AdminConsoleKey;
  buttonHtmlType?: 'submit' | 'button';
  buttonType?: 'primary' | 'outline';
  isLoading?: boolean;
  onButtonClick?: () => void;
}>;

function Step({
  children,
  title,
  subtitle,
  index,
  activeIndex,
  buttonText = 'general.next',
  buttonHtmlType = 'button',
  buttonType = 'outline',
  isLoading,
  onButtonClick,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = index === activeIndex;
  const isComplete = index < activeIndex;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (isExpanded) {
      ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [isExpanded]);

  const onToggle = useCallback(() => {
    setIsExpanded((expand) => !expand);
  }, [setIsExpanded]);

  return (
    <Card key={title} ref={ref} className={styles.card}>
      <div
        role="button"
        tabIndex={0}
        className={styles.header}
        onKeyDown={onKeyDownHandler({
          Esc: () => {
            setIsExpanded(false);
          },
          Enter: onToggle,
          ' ': onToggle,
        })}
        onClick={onToggle}
      >
        <Index
          className={styles.index}
          index={index + 1}
          isActive={isActive}
          isComplete={isComplete}
        />
        <CardTitle
          size="medium"
          title={<DangerousRaw>{title}</DangerousRaw>}
          subtitle={<DangerousRaw>{subtitle}</DangerousRaw>}
        />
        <Spacer />
        <IconButton>{isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
      </div>
      <div className={classNames(styles.content, isExpanded && styles.expanded)}>
        {children}
        <div className={styles.buttonWrapper}>
          <Button
            type={buttonType}
            size="large"
            isLoading={isLoading}
            htmlType={buttonHtmlType}
            title={buttonText}
            onClick={onButtonClick}
          />
        </div>
      </div>
    </Card>
  );
}

export default Step;
