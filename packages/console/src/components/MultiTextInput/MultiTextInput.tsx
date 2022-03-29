import React from 'react';
import { useTranslation } from 'react-i18next';

import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import Minus from '@/icons/Minus';

import IconButton from '../IconButton';
import TextInput from '../TextInput';
import * as styles from './MultiTextInput.module.scss';
import { UseMultiTextInputRhfReturn } from './type';

type Props = UseMultiTextInputRhfReturn;

const MultiTextInput = ({ fields, errors, handleAdd, handleRemove, handleInputChange }: Props) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'general',
  });

  return (
    <div className={styles.multilineInput}>
      {fields.map((fieldValue, fieldIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={fieldIndex}>
          <div className={styles.deletableInput}>
            <TextInput
              hasError={Boolean(errors.inputs[fieldIndex])}
              className={styles.textField}
              value={fieldValue}
              onChange={(event) => {
                handleInputChange(event, fieldIndex);
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
          {fieldIndex === 0 && errors.required && (
            <div className={styles.error}>{errors.required}</div>
          )}
          {errors.inputs[fieldIndex] && (
            <div className={styles.error}>{errors.inputs[fieldIndex]}</div>
          )}
        </div>
      ))}
      <div className={textButtonStyles.button} onClick={handleAdd}>
        {t('add_another')}
      </div>
    </div>
  );
};

export default MultiTextInput;
