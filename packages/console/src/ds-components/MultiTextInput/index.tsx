import type { AdminConsoleKey } from '@logto/phrases';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { KeyboardEvent } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Minus from '@/assets/icons/minus.svg?react';

import Button from '../Button';
import ConfirmModal from '../ConfirmModal';
import IconButton from '../IconButton';
import TextInput from '../TextInput';

import styles from './index.module.scss';
import type { MultiTextInputError } from './types';

export type Props = {
  readonly title: AdminConsoleKey;
  readonly value?: string[];
  readonly onChange: (value: string[]) => void;
  readonly onKeyPress?: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly error?: MultiTextInputError;
  readonly placeholder?: string;
  readonly className?: string;
};

function MultiTextInput({
  title,
  value,
  onChange,
  onKeyPress,
  error,
  placeholder,
  className,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [deleteFieldIndex, setDeleteFieldIndex] = useState<number>();

  const fields = useMemo(() => {
    if (!value?.length) {
      return [''];
    }

    return value;
  }, [value]);

  const handleAdd = () => {
    onChange([...fields, '']);
  };

  const handleRemove = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const handleInputChange = (inputValue: string, index: number) => {
    onChange(fields.map((fieldValue, i) => (i === index ? inputValue : fieldValue)));
  };

  return (
    <div className={classNames(styles.multilineInput, className)}>
      {fields.map((fieldValue, fieldIndex) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={fieldIndex}
          className={conditional(
            fields.length > 1 && fieldIndex === 0 && styles.firstFieldWithMultiInputs
          )}
        >
          <div className={styles.deletableInput}>
            <TextInput
              error={Boolean(error?.inputs?.[fieldIndex] ?? (fieldIndex === 0 && error?.required))}
              value={fieldValue}
              placeholder={placeholder}
              onChange={({ currentTarget: { value } }) => {
                handleInputChange(value, fieldIndex);
              }}
              onKeyPress={onKeyPress}
            />
            {fieldIndex > 0 && (
              <IconButton
                onClick={() => {
                  if (fieldValue.trim().length === 0) {
                    handleRemove(fieldIndex);
                  } else {
                    setDeleteFieldIndex(fieldIndex);
                  }
                }}
              >
                <Minus className={styles.minusIcon} />
              </IconButton>
            )}
          </div>
          {fieldIndex === 0 && error?.required && (
            <div className={styles.error}>{error.required}</div>
          )}
          {error?.inputs?.[fieldIndex] && (
            <div className={styles.error}>{error.inputs[fieldIndex]}</div>
          )}
        </div>
      ))}
      <Button
        size="small"
        type="text"
        title="general.add_another"
        className={styles.addAnother}
        icon={<CirclePlus />}
        onClick={handleAdd}
      />
      <ConfirmModal
        isOpen={deleteFieldIndex !== undefined}
        confirmButtonText="general.delete"
        onCancel={() => {
          setDeleteFieldIndex(undefined);
        }}
        onConfirm={() => {
          if (deleteFieldIndex !== undefined) {
            handleRemove(deleteFieldIndex);
            setDeleteFieldIndex(undefined);
          }
        }}
      >
        {t('general.deletion_confirmation', { title: t(title) })}
      </ConfirmModal>
    </div>
  );
}

export default MultiTextInput;
