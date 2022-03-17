import { nanoid } from 'nanoid';
import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import Minus from '@/icons/Minus';

import IconButton from '../IconButton';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
};

type FieldItem = {
  id: string;
  value: string;
};

const MultilineInput = ({ values, onChange }: Props) => {
  const [fields, setFileds] = useState<FieldItem[]>([]);

  const { t } = useTranslation(undefined, {
    keyPrefix: 'general',
  });

  useEffect(() => {
    if (values.length === 0) {
      setFileds([{ id: nanoid(), value: '' }]);

      return;
    }

    setFileds(
      values.map((value) => ({
        id: nanoid(),
        value,
      }))
    );
  }, [values]);

  const handleInputChange = (event: FormEvent<HTMLInputElement>, index: number) => {
    setFileds(
      fields.map((field, fieldIndex) =>
        fieldIndex === index ? { id: field.id, value: event.currentTarget.value } : field
      )
    );
  };

  const handleAdd = () => {
    setFileds([...fields, { id: nanoid(), value: '' }]);
  };

  const handleRemove = (index: number) => {
    setFileds(fields.filter((_, fieldIndex) => fieldIndex !== index));
  };

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (event) => {
    const { relatedTarget, currentTarget } = event;

    // Should not trigger update outer values when switch between input fields inside
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }

    // TODO LOG-1916: MultilineInput Value Validation.
    onChange(fields.map((field) => field.value));
  };

  return (
    <div className={styles.multilineInput} onBlur={handleBlur}>
      {fields.map((field, index) => (
        <div key={field.id} className={styles.deletableInput}>
          <div>
            <TextInput
              className={styles.textField}
              defaultValue={field.value}
              onChange={(event) => {
                handleInputChange(event, index);
              }}
            />
          </div>
          {fields.length > 1 && (
            <IconButton
              onClick={() => {
                handleRemove(index);
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
