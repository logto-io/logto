import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import React, {
  cloneElement,
  isValidElement,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CodeProps } from 'react-markdown/lib/ast-to-react.js';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import { ArrowDown, ArrowUp } from '@/icons/Arrow';
import Tick from '@/icons/Tick';

import CodeComponentRenderer from '../CodeComponentRenderer';
import * as styles from './index.module.scss';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  isFinalStep: boolean;
  buttonHtmlType: 'submit' | 'button';
  onNext?: () => void;
}>;

const Step = ({
  children,
  title,
  subtitle,
  index,
  isActive,
  isComplete,
  isFinalStep,
  buttonHtmlType,
  onNext,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const scrollToStep = useCallback(() => {
    ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, []);

  const onError = useCallback(() => {
    setIsExpanded(true);
    scrollToStep();
  }, [scrollToStep]);

  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (isExpanded) {
      scrollToStep();
    }
  }, [isExpanded, scrollToStep]);

  const memoizedComponents = useMemo(
    () => ({
      code: ({ ...props }: PropsWithChildren<CodeProps>) => (
        <CodeComponentRenderer {...props} onError={onError} />
      ),
    }),
    [onError]
  );

  // TODO: add more styles to markdown renderer
  return (
    <Card key={title} ref={ref} className={styles.card}>
      <div
        className={styles.header}
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        <div
          className={classNames(
            styles.index,
            isActive && styles.active,
            isComplete && styles.completed
          )}
        >
          {isComplete ? <Tick /> : index + 1}
        </div>
        <CardTitle
          size="medium"
          title={<DangerousRaw>{title}</DangerousRaw>}
          subtitle={<DangerousRaw>{subtitle}</DangerousRaw>}
        />
        <Spacer />
        <IconButton>{isExpanded ? <ArrowUp /> : <ArrowDown />}</IconButton>
      </div>
      <div className={classNames(styles.content, isExpanded && styles.expanded)}>
        {isValidElement(children) && cloneElement(children, { components: memoizedComponents })}
        <div className={styles.buttonWrapper}>
          <Button
            htmlType={buttonHtmlType}
            type="primary"
            title={`general.${isFinalStep ? 'done' : 'next'}`}
            onClick={conditional(!isFinalStep && onNext)}
          />
        </div>
      </div>
    </Card>
  );
};

export default Step;
