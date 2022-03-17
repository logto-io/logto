import { nanoid } from 'nanoid';
import React, { useMemo, useRef } from 'react';
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

  const ids = useRef([nanoid()]);
  const items = useMemo(() => {
    if (value.length > 0 && value.length !== ids.current.length) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      ids.current = value.map(() => nanoid());
    }

    if (value.length === 0) {
      return [''];
    }

    return value;
  }, [value]);

  return (
    <div className={styles.multilineInput}>
      {items.map((itemValue, itemIndex) => (
        <div key={ids.current[itemIndex]} className={styles.deletableInput}>
          <div>
            <TextInput
              className={styles.textField}
              defaultValue={itemValue}
              onChange={(event) => {
                onChange(
                  items.map((value, i) => (i === itemIndex ? event.currentTarget.value : value))
                );
              }}
            />
          </div>
          {items.length > 1 && (
            <IconButton
              onClick={() => {
                onChange(items.filter((_, i) => i !== itemIndex));
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
          onChange([...value, '']);
        }}
      >
        {t('add_another')}
      </div>
    </div>
  );
};

export default MultilineInput;
