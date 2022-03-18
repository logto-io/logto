import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import Minus from '@/icons/Minus';

import IconButton from '../IconButton';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
};

const MultilineInput = ({ value, onChange }: Props) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'general',
  });

  const fields = useMemo(() => {
    if (value.length === 0) {
      return [''];
    }

    return value;
  }, [value]);

  const handleAdd = () => {
    onChange([...value, '']);
  };

  const handleRemove = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>, index: number) => {
    onChange(fields.map((value, i) => (i === index ? event.currentTarget.value : value)));
  };

  return (
    <div className={styles.multilineInput}>
      {fields.map((fieldValue, fieldIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={fieldIndex} className={styles.deletableInput}>
          <div>
            <TextInput
              className={styles.textField}
              defaultValue={fieldValue}
              onChange={(event) => {
                handleInputChange(event, fieldIndex);
              }}
            />
          </div>
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
      ))}
      <div className={textButtonStyles.button} onClick={handleAdd}>
        {t('add_another')}
      </div>
    </div>
  );
};

export default MultilineInput;
