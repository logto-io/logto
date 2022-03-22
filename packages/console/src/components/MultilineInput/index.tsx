import React, { useEffect } from 'react';
import {
  UseFormRegister,
  FieldValues,
  Control,
  ArrayPath,
  useFieldArray,
  RegisterOptions,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import Minus from '@/icons/Minus';

import IconButton from '../IconButton';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';

type Props<T extends FieldValues = FieldValues> = {
  name: ArrayPath<T>;
  register: UseFormRegister<T>;
  options?: RegisterOptions;
  control: Control<T>;
};

const MultilineInput = <T extends FieldValues = FieldValues>({
  name,
  register,
  options,
  control,
}: Props<T>) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'general',
  });

  const { fields, append, remove } = useFieldArray({ control, name });

  useEffect(() => {
    if (fields.length === 0) {
      // @ts-expect-error: FIXME
      append('');
    }
  }, [fields, append]);

  return (
    <div className={styles.multilineInput}>
      {fields.map((field, index) => (
        <div key={field.id} className={styles.deletableInput}>
          <TextInput
            // @ts-expect-error: https://stackoverflow.com/questions/66967241/argument-of-type-string-is-not-assignable-to-parameter-of-type-string
            {...register(`${name}.${index}`, options)}
            className={styles.textField}
          />
          {index > 0 && (
            <IconButton
              onClick={() => {
                remove(index);
              }}
            >
              <Minus />
            </IconButton>
          )}
        </div>
      ))}
      <div
        className={textButtonStyles.button}
        onClick={() => {
          // @ts-expect-error: FIXME
          append('');
        }}
      >
        {t('add_another')}
      </div>
    </div>
  );
};

export default MultilineInput;
