import { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Index from '@/components/Index';
import Spacer from '@/components/Spacer';
import { KeyboardArrowDown, KeyboardArrowUp } from '@/icons/Arrow';

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

const Step = ({
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
}: Props) => {
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

  return (
    <Card key={title} ref={ref} className={styles.card}>
      <div
        className={styles.header}
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
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
};

export default Step;
