import { I18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import Minus from '@/icons/Minus';
import * as modalStyles from '@/scss/modal.module.scss';

import IconButton from '../IconButton';
import TextInput from '../TextInput';
import DeleteConfirm from './DeleteConfirm';
import * as styles from './index.module.scss';
import { MultiTextInputError } from './types';

type Props = {
  title: I18nKey;
  value?: string[];
  onChange: (value: string[]) => void;
  error?: MultiTextInputError;
};

const MultiTextInput = ({ title, value, onChange, error }: Props) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

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
              onChange={({ currentTarget: { value } }) => {
                handleInputChange(value, fieldIndex);
              }}
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
      <div className={classNames(textButtonStyles.button, styles.addAnother)} onClick={handleAdd}>
        {t('form.add_another')}
      </div>
      <Modal
        isOpen={deleteFieldIndex !== undefined}
        className={modalStyles.content}
        overlayClassName={modalStyles.overlay}
      >
        <DeleteConfirm
          title={title}
          onClose={() => {
            setDeleteFieldIndex(undefined);
          }}
          onConfirm={() => {
            if (deleteFieldIndex !== undefined) {
              handleRemove(deleteFieldIndex);
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default MultiTextInput;
