import InputField from '@experience/shared/components/InputFields/InputField';
import { SupportedDateFormat } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo, useState } from 'react';

import styles from './DateField.module.scss';
import type { EditableValue } from './utils';

type Props = {
  readonly name: string;
  readonly label: string;
  readonly value: EditableValue;
  readonly dateFormat?: string;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly isRequired: boolean;
  readonly placeholder?: string;
  readonly onChange: (value: string) => void;
};

type DateFormatConfig = {
  separator: string;
  parts: string[];
  maxLengths: number[];
};

const isSupportedDateFormat = (dateFormat?: string): dateFormat is SupportedDateFormat =>
  dateFormat === SupportedDateFormat.US ||
  dateFormat === SupportedDateFormat.UK ||
  dateFormat === SupportedDateFormat.ISO;

const getDateFormatConfig = (dateFormat: SupportedDateFormat): DateFormatConfig => {
  const separator = dateFormat === SupportedDateFormat.ISO ? '-' : '/';
  const parts = dateFormat.split(separator);

  return {
    separator,
    parts,
    maxLengths: parts.map((part) => part.length),
  };
};

const DateField = ({
  name,
  label,
  value,
  dateFormat,
  description,
  errorMessage,
  isRequired,
  placeholder,
  onChange,
}: Props) => {
  const valueString = typeof value === 'boolean' ? '' : value;
  const [isFocused, setIsFocused] = useState(false);
  const formatConfig = useMemo(
    () => (isSupportedDateFormat(dateFormat) ? getDateFormatConfig(dateFormat) : undefined),
    [dateFormat]
  );
  const dateParts = useMemo(() => {
    if (!valueString || !formatConfig) {
      return ['', '', ''];
    }

    return valueString.split(formatConfig.separator);
  }, [formatConfig, valueString]);

  if (!formatConfig) {
    return (
      <InputField
        name={name}
        label={label}
        required={isRequired}
        value={valueString}
        description={description}
        errorMessage={errorMessage}
        isDanger={Boolean(errorMessage)}
        placeholder={placeholder ?? dateFormat}
        onChange={({ currentTarget }) => {
          onChange(currentTarget.value);
        }}
      />
    );
  }

  const handleChange = (index: number, nextValue: string) => {
    const maxLength = formatConfig.maxLengths[index];
    const nextParts = dateParts.map((part, partIndex) =>
      partIndex === index ? nextValue.replaceAll(/\D/g, '').slice(0, maxLength) : part
    );
    const nextDate = nextParts.every((part) => !part) ? '' : nextParts.join(formatConfig.separator);
    onChange(nextDate);
  };

  return (
    <div className={styles.dateFieldContainer}>
      <div
        className={classNames(
          styles.dateInputWrapper,
          isFocused && styles.active,
          errorMessage && styles.danger
        )}
      >
        <span className={classNames(styles.label, (isFocused || valueString) && styles.active)}>
          {label}
        </span>
        {formatConfig.parts.map((part, index) => (
          <div key={`${name}-${part}`} className={styles.part}>
            <input
              aria-label={`${label} ${part}`}
              value={dateParts[index] ?? ''}
              placeholder={part.toUpperCase()}
              maxLength={formatConfig.maxLengths[index]}
              inputMode="numeric"
              pattern="[0-9]*"
              onFocus={() => {
                setIsFocused(true);
              }}
              onBlur={() => {
                setIsFocused(false);
              }}
              onChange={({ currentTarget }) => {
                handleChange(index, currentTarget.value);
              }}
            />
            {index < formatConfig.parts.length - 1 && (
              <span className={styles.separator}>{formatConfig.separator}</span>
            )}
          </div>
        ))}
      </div>
      {description && <div className={styles.description}>{description}</div>}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
};

export default DateField;
