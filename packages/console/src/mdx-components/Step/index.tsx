import { I18nKey } from '@logto/phrases';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Index from '@/components/Index';
import Spacer from '@/components/Spacer';
import { ArrowDown, ArrowUp } from '@/icons/Arrow';

import * as styles from './index.module.scss';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  index: number;
  activeIndex: number;
  invalidIndex?: number;
  buttonText?: I18nKey;
  buttonHtmlType: 'submit' | 'button';
  onNext?: () => void;
}>;

const Step = ({
  children,
  title,
  subtitle,
  index,
  activeIndex,
  invalidIndex,
  buttonText = 'general.next',
  buttonHtmlType = 'button',
  onNext,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = index === activeIndex;
  const isComplete = index < activeIndex;
  const isInvalid = index === invalidIndex;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive || isInvalid) {
      setIsExpanded(true);
    }
  }, [isActive, isInvalid]);

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
        <IconButton>{isExpanded ? <ArrowUp /> : <ArrowDown />}</IconButton>
      </div>
      <div className={classNames(styles.content, isExpanded && styles.expanded)}>
        {children}
        <div className={styles.buttonWrapper}>
          <Button
            htmlType={buttonHtmlType}
            type="primary"
            title={buttonText}
            onClick={conditional(onNext)}
          />
        </div>
      </div>
    </Card>
  );
};

export default Step;
