import classNames from 'classnames';
import React, { forwardRef, Ref } from 'react';
import ReactMarkdown from 'react-markdown';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import { ArrowDown, ArrowUp } from '@/icons/Arrow';
import Tick from '@/icons/Tick';

import * as styles from './index.module.scss';

export type StepMetadata = {
  title?: string;
  subtitle?: string;
  metadata: string; // Markdown formatted string
};

type Props = {
  data: StepMetadata;
  index: number;
  isCompleted: boolean;
  isExpanded: boolean;
  isFinalStep: boolean;
  onComplete?: () => void;
  onNext?: () => void;
  onToggle?: () => void;
};

const Step = (
  { data, index, isCompleted, isExpanded, isFinalStep, onComplete, onNext, onToggle }: Props,
  ref?: Ref<HTMLDivElement>
) => {
  const { title, subtitle, metadata } = data;

  // Steps in get-started must have "title" declared in the Yaml header of the markdown source file
  if (!title) {
    return null;
  }

  // TODO: add more styles to markdown renderer
  // TODO: render form and input fields in steps
  return (
    <Card key={title} ref={ref} className={styles.card}>
      <div className={styles.cardHeader} onClick={onToggle}>
        <div
          className={classNames(
            styles.index,
            isExpanded && styles.active,
            isCompleted && styles.completed
          )}
        >
          {isCompleted ? <Tick /> : index + 1}
        </div>
        <CardTitle
          size="medium"
          title={<DangerousRaw>{title}</DangerousRaw>}
          subtitle={<DangerousRaw>{subtitle}</DangerousRaw>}
        />
        <Spacer />
        <IconButton>{isExpanded ? <ArrowUp /> : <ArrowDown />}</IconButton>
      </div>
      {isExpanded && (
        <>
          <ReactMarkdown className={styles.markdownContent}>{metadata}</ReactMarkdown>
          <div className={styles.buttonWrapper}>
            <Button
              type="primary"
              title={`general.${isFinalStep ? 'done' : 'next'}`}
              onClick={() => {
                if (isFinalStep) {
                  onComplete?.();
                } else {
                  onNext?.();
                }
              }}
            />
          </div>
        </>
      )}
    </Card>
  );
};

export default forwardRef(Step);
