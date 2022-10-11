import { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { KeyboardEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Minus from '@/assets/images/minus.svg';
import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import { onKeyDownHandler } from '@/utilities/a11y';

import ConfirmModal from '../ConfirmModal';
import IconButton from '../IconButton';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';
import { MultiTextInputError } from './types';

type Props = {
  title: AdminConsoleKey;
  value?: string[];
  onChange: (value: string[]) => void;
  onKeyPress?: (event: KeyboardEvent<HTMLInputElement>) => void;
  error?: MultiTextInputError;
  placeholder?: string;
};

const MultiTextInput = ({ title, value, onChange, onKeyPress, error, placeholder }: Props) => {
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
    <div className={styles.multilineInput}>
      {fields.map((fieldValue, fieldIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={fieldIndex}>
          <div className={styles.deletableInput}>
            <TextInput
              hasError={Boolean(
                error?.inputs?.[fieldIndex] || (fieldIndex === 0 && error?.required)
              )}
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
      <div
        role="button"
        tabIndex={0}
        className={classNames(textButtonStyles.button, styles.addAnother)}
        onKeyDown={onKeyDownHandler(handleAdd)}
        onClick={handleAdd}
      >
        {t('general.add_another')}
      </div>
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
};

export default MultiTextInput;
