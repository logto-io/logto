import { emailRegEx } from '@logto/core-kit';
import { generateStandardShortId } from '@logto/shared/universal';
import { conditional, type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Close from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';
import Tag from '@/ds-components/Tag';
import { onKeyDownHandler } from '@/utils/a11y';

import type { InviteeEmailItem, InviteMemberForm } from '../types';

import useEmailInputUtils from './hooks';
import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly values: InviteeEmailItem[];
  readonly onChange: (values: InviteeEmailItem[]) => void;
  readonly error?: string | boolean;
  readonly placeholder?: string;
};

/**
 * The body-2 font declared in @logto/core-kit/scss/fonts. It is referenced here to calculate
 * the width of the input text, which determines the minimum width of the input field.
 */
const fontBody2 =
  '400 14px / 20px -apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji';

function InviteEmailsInput({
  className,
  values,
  onChange: rawOnChange,
  error,
  placeholder,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [focusedValueId, setFocusedValueId] = useState<Nullable<string>>(null);
  const [currentValue, setCurrentValue] = useState('');
  const { setError, clearErrors } = useFormContext<InviteMemberForm>();
  const { parseEmailOptions } = useEmailInputUtils();
  const [minInputWidth, setMinInputWidth] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Render placeholder text in canvas to calculate its width in CSS pixels.
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.font = fontBody2;
    setMinInputWidth(ctx.measureText(currentValue).width);
  }, [currentValue]);

  const onChange = (values: InviteeEmailItem[]) => {
    const { values: parsedValues, errorMessage } = parseEmailOptions(values);
    if (errorMessage) {
      setError('emails', { type: 'custom', message: errorMessage });
    } else {
      clearErrors('emails');
    }
    rawOnChange(parsedValues);
  };

  const handleAdd = (value: string) => {
    const newValues: InviteeEmailItem[] = [
      ...values,
      {
        value,
        id: generateStandardShortId(),
        ...conditional(!emailRegEx.test(value) && { status: 'error' }),
      },
    ];
    onChange(newValues);
    setCurrentValue('');
    ref.current?.focus();
  };

  const handleDelete = (option: InviteeEmailItem) => {
    onChange(values.filter(({ id }) => id !== option.id));
  };

  return (
    <>
      <div
        className={classNames(styles.input, Boolean(error) && styles.error, className)}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDownHandler(() => {
          ref.current?.focus();
        })}
        onClick={() => {
          ref.current?.focus();
        }}
      >
        <div className={styles.wrapper}>
          {values.map((option) => (
            <Tag
              key={option.id}
              variant="cell"
              className={classNames(
                styles.tag,
                option.status && styles[option.status],
                option.id === focusedValueId && styles.focused
              )}
              onClick={() => {
                ref.current?.focus();
              }}
            >
              {option.value}
              <IconButton
                className={styles.delete}
                size="small"
                onClick={() => {
                  handleDelete(option);
                }}
                onKeyDown={onKeyDownHandler(() => {
                  handleDelete(option);
                })}
              >
                <Close className={styles.close} />
              </IconButton>
            </Tag>
          ))}
          <input
            ref={ref}
            placeholder={conditional(values.length === 0 && placeholder)}
            value={currentValue}
            style={{ minWidth: `${minInputWidth + 10}px` }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && currentValue === '') {
                if (focusedValueId) {
                  onChange(values.filter(({ id }) => id !== focusedValueId));
                  setFocusedValueId(null);
                } else {
                  setFocusedValueId(values.at(-1)?.id ?? null);
                }
                ref.current?.focus();
              }
              if (event.key === ' ' || event.code === 'Space' || event.key === 'Enter') {
                // Focusing on input
                if (currentValue !== '' && document.activeElement === ref.current) {
                  handleAdd(currentValue);
                }
                // Do not react to "Enter"
                event.preventDefault();
              }
            }}
            onChange={({ currentTarget: { value } }) => {
              setCurrentValue(value);
              setFocusedValueId(null);
            }}
            onFocus={() => {
              ref.current?.focus();
            }}
            onBlur={() => {
              if (currentValue !== '') {
                handleAdd(currentValue);
              }
              setFocusedValueId(null);
            }}
          />
        </div>
      </div>
      {Boolean(error) && typeof error === 'string' && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      <canvas ref={canvasRef} />
    </>
  );
}

export default InviteEmailsInput;
