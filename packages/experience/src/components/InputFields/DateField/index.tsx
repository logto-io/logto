import { SupportedDateFormat } from '@logto/schemas';
import { cond, condString } from '@silverhand/essentials';
import classNames from 'classnames';
import type { FormEventHandler, KeyboardEventHandler, ClipboardEventHandler } from 'react';
import { useCallback, useState, useRef, useMemo, Fragment, useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';

import InputField from '../InputField';
import NotchedBorder from '../InputField/NotchedBorder';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly name?: string;
  readonly dateFormat?: string;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly label?: string;
  readonly placeholder?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly required?: boolean;
  readonly value?: string;
  readonly onBlur?: () => void;
  readonly onChange?: (value: string) => void;
};

type DateFormatConfig = {
  separator: string;
  parts: string[];
  maxLengths: number[];
};

/**
 * Used to calculate the fallback input width when the browser does not support `field-sizing: content` CSS style.
 * The maximum length of the inner input fields is 4 (YYYY), but the font is not monospace so we need to increase
 * the size by 1 to make sure the input placeholder text is always fully visible.
 */
const getDefaultInputSize = (digit = 4) => digit + 1;

const isNumeric = (char: string) => /^\d+$/.test(char);

const getDateFormatConfig = (format: string): DateFormatConfig | undefined => {
  if (format === SupportedDateFormat.Custom) {
    return;
  }

  const separator = format === SupportedDateFormat.ISO ? '-' : '/';
  const parts = format.split(separator);

  return {
    separator,
    parts,
    maxLengths: parts.map((part) => part.length),
  };
};

const DateField = (props: Props) => {
  const {
    className,
    dateFormat,
    description,
    errorMessage,
    label,
    required,
    value,
    onBlur,
    onChange,
  } = props;
  const { t } = useTranslation();
  const labelWithOptionalSuffix = required
    ? label
    : condString(label && t('input.label_with_optional', { label }));

  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || !!value;
  const firstInputId = useId();
  const inputReferences = useRef<Array<HTMLInputElement | undefined>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSupportedDateFormat =
    dateFormat === SupportedDateFormat.US ||
    dateFormat === SupportedDateFormat.UK ||
    dateFormat === SupportedDateFormat.ISO;

  const formatConfig = useMemo(() => {
    if (!isSupportedDateFormat) {
      return;
    }
    return getDateFormatConfig(dateFormat);
  }, [dateFormat, isSupportedDateFormat]);

  const dateParts = useMemo(() => {
    if (!value || !formatConfig?.separator) {
      return ['', '', ''];
    }
    return value.split(formatConfig.separator);
  }, [value, formatConfig?.separator]);

  const handleOnChange = useCallback(
    (parts: string[]) => {
      const newValue = parts.every((part) => !part)
        ? ''
        : parts.join(formatConfig?.separator ?? '');
      onChange?.(newValue);
    },
    [formatConfig?.separator, onChange]
  );

  const updateValue = useCallback(
    (data: string, targetId: number) => {
      if (!formatConfig || !isNumeric(data)) {
        return;
      }

      const fillInputField = (
        currentTargetId: number,
        remainingData: string,
        currentParts: string[]
      ): string[] => {
        if (currentTargetId >= currentParts.length || !remainingData) {
          return currentParts;
        }

        const fieldMaxLength = formatConfig.maxLengths[currentTargetId] ?? 0;
        const fieldData = remainingData.slice(0, fieldMaxLength);
        const updatedParts = currentParts.map((part, index) =>
          index === currentTargetId ? fieldData : part
        );

        const remainingAfterCurrent = remainingData.slice(fieldMaxLength);
        if (remainingAfterCurrent) {
          return fillInputField(currentTargetId + 1, remainingAfterCurrent, updatedParts);
        }

        inputReferences.current[currentTargetId]?.focus();

        return updatedParts;
      };

      const finalParts = fillInputField(targetId, data, dateParts);
      handleOnChange(finalParts);
    },
    [dateParts, formatConfig, handleOnChange]
  );

  const onInputHandler: FormEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }
      const { value, dataset } = event.target;
      if (!dataset.id) {
        return;
      }

      event.preventDefault();
      updateValue(value, Number(dataset.id));
    },
    [updateValue]
  );

  const onPasteHandler: ClipboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }

      const { target, clipboardData } = event;
      if (!target.dataset.id) {
        return;
      }

      const data = clipboardData.getData('text').match(/\d/g)?.join('');

      if (data) {
        event.preventDefault();
        updateValue(data, Number(target.dataset.id));
      }
    },
    [updateValue]
  );

  const onKeyDownHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { key, target } = event;

      if (!(target instanceof HTMLInputElement) || !formatConfig) {
        return;
      }

      const { value, dataset } = target;

      if (!dataset.id) {
        return;
      }

      const targetId = Number(dataset.id);
      const nextTarget = inputReferences.current[targetId + 1];
      const previousTarget = inputReferences.current[targetId - 1];

      switch (key) {
        case 'Backspace': {
          event.preventDefault();

          if (value) {
            const clearedParts = dateParts.map((part, index) => (index === targetId ? '' : part));
            handleOnChange(clearedParts);
          } else if (previousTarget) {
            previousTarget.focus();
            const clearedParts = dateParts.map((part, index) =>
              index === targetId - 1 ? '' : part
            );
            handleOnChange(clearedParts);
          }
          break;
        }

        case 'ArrowLeft': {
          if (target.selectionStart === 0) {
            event.preventDefault();
            previousTarget?.focus();
          }
          break;
        }

        case 'ArrowRight': {
          if (target.selectionStart === value.length) {
            event.preventDefault();
            nextTarget?.focus();
          }
          break;
        }

        case '+':
        case '-':
        case 'e':
        case '.': {
          event.preventDefault();
          break;
        }

        default: {
          break;
        }
      }
    },
    [dateParts, formatConfig, handleOnChange]
  );

  useEffect(() => {
    if (isFocused && !value) {
      inputReferences.current[0]?.focus();
    }
  }, [isFocused, value]);

  if (!isSupportedDateFormat) {
    const { dateFormat, ...restProps } = props;
    return (
      <InputField
        {...restProps}
        onChange={(event) => {
          onChange?.(event.currentTarget.value);
        }}
      />
    );
  }

  return (
    <div ref={containerRef} className={classNames(styles.dateFieldContainer, className)}>
      <div
        className={styles.dateInputWrapper}
        // Rely on bubbling onBlur from inner inputs to detect leaving the whole group
        onBlur={(event) => {
          const { relatedTarget } = event;
          if (!relatedTarget || !containerRef.current?.contains(relatedTarget)) {
            setIsFocused(false);
            onBlur?.();
          }
        }}
      >
        {labelWithOptionalSuffix && (
          <label
            htmlFor={firstInputId}
            className={classNames(styles.clickOverlay, isActive && styles.disabled)}
          >
            <span>{labelWithOptionalSuffix}</span>
          </label>
        )}
        <NotchedBorder
          isActive={isActive}
          isFocused={isFocused}
          label={labelWithOptionalSuffix ?? ''}
          isDanger={!!errorMessage}
        />
        {formatConfig?.parts.map((part, index) => (
          <Fragment key={part}>
            <input
              ref={(element) => {
                // eslint-disable-next-line @silverhand/fp/no-mutation
                inputReferences.current[index] = element ?? undefined;
              }}
              id={cond(index === 0 && firstInputId)}
              data-id={index}
              className={classNames(isActive && styles.active)}
              placeholder={part.toUpperCase()}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              // Fallback solution to `field-sizing` in CSS for non-chromium browsers
              size={getDefaultInputSize(formatConfig.maxLengths[index])}
              value={dateParts[index] ?? ''}
              onPaste={onPasteHandler}
              onInput={onInputHandler}
              onKeyDown={onKeyDownHandler}
              onFocus={() => {
                setIsFocused(true);
              }}
            />
            {index < formatConfig.parts.length - 1 && (
              <span className={classNames(isActive && styles.active, styles.separator)}>
                {formatConfig.separator}
              </span>
            )}
          </Fragment>
        ))}
      </div>
      {description && <div className={styles.description}>{description}</div>}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
};

export default DateField;
