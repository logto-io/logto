import { I18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import useConfirmModal from '@/hooks/use-confirm-modal';
import Minus from '@/icons/Minus';

import IconButton from '../IconButton';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';
import { MultiTextInputError } from './types';

type Props = {
  title: I18nKey;
  value?: string[];
  onChange: (value: string[]) => void;
  error?: MultiTextInputError;
};

const MultiTextInput = ({ title, value, onChange, error }: Props) => {
  const { t } = useTranslation();

  const { confirm } = useConfirmModal();

  const fields = useMemo(() => {
    if (!value?.length) {
      return [''];
    }

    return value;
  }, [value]);

  const handleAdd = () => {
    onChange([...fields, '']);
  };

  const handleRemove = async (index: number, needConfirm = true) => {
    if (needConfirm) {
      const confirmed = await confirm({
        content: t('admin_console.form.deletion_confirmation', { title: t(title) }),
        confirmButtonText: 'admin_console.form.delete',
      });

      if (!confirmed) {
        return;
      }
    }

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
                onClick={async () => {
                  await handleRemove(fieldIndex, Boolean(fieldValue.trim()));
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
      <div className={classNames(textButtonStyles.button, styles.addAnother)} onClick={handleAdd}>
        {t('admin_console.form.add_another')}
      </div>
    </div>
  );
};

export default MultiTextInput;
