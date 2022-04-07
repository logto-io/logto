import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeProps } from 'react-markdown/lib/ast-to-react.js';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import { ArrowDown, ArrowUp } from '@/icons/Arrow';
import Tick from '@/icons/Tick';
import { StepMetadata } from '@/types/get-started';

import CodeComponentRenderer from '../CodeComponentRenderer';
import * as styles from './index.module.scss';

type Props = {
  data: StepMetadata;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  isFinalStep: boolean;
  onNext?: () => void;
};

const Step = ({ data, index, isActive, isComplete, isFinalStep, onNext }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { title, subtitle, metadata } = data;
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

  // Steps in get-started must have "title" declared in the Yaml header of the markdown source file
  if (!title) {
    return null;
  }

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
        <ReactMarkdown className={styles.markdownContent} components={memoizedComponents}>
          {metadata}
        </ReactMarkdown>
        <div className={styles.buttonWrapper}>
          <Button
            htmlType={isFinalStep ? 'submit' : 'button'}
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
