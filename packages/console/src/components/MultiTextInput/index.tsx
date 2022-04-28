import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import Minus from '@/icons/Minus';

import IconButton from '../IconButton';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';
import { MultiTextInputError } from './types';

type Props = {
  value?: string[];
  onChange: (value: string[]) => void;
  error?: MultiTextInputError;
};

const MultiTextInput = ({ value, onChange, error }: Props) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

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
              onChange={({ currentTarget: { value } }) => {
                handleInputChange(value, fieldIndex);
              }}
            />
            {fields.length > 1 && (
              <IconButton
                onClick={() => {
                  handleRemove(fieldIndex);
                }}
              >
                <Minus />
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
      <div className={textButtonStyles.button} onClick={handleAdd}>
        {t('form.add_another')}
      </div>
    </div>
  );
};

export default MultiTextInput;
