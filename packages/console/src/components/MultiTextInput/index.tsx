import React, { useMemo, useRef, useState } from 'react';
import {
  useController,
  Control,
  FieldPath,
  UnpackNestedValue,
  PathValue,
  Path,
  FieldValues,
  Primitive,
} from 'react-hook-form';
import { IsTuple, TupleKeys, ArrayKey } from 'react-hook-form/dist/types/path/common';
import { useTranslation } from 'react-i18next';

import * as textButtonStyles from '@/components/TextButton/index.module.scss';
import Minus from '@/icons/Minus';

import IconButton from '../IconButton';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';

type StringArrayPathImpl<K extends string | number, V> = V extends Primitive
  ? never
  : V extends ReadonlyArray<infer U>
  ? U extends string
    ? `${K}`
    : never
  : `${K}.${StringArrayPath<V>}`;

type StringArrayPath<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: StringArrayPathImpl<K & string, T[K]>;
      }[TupleKeys<T>]
    : StringArrayPathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: StringArrayPathImpl<K & string, T[K]>;
    }[keyof T];

/**
 * Type which eagerly collects all paths through a type which point to a string array
 * type.
 * @typeParam TFieldValues - type which should be introspected
 * @example
 * ```
 * StringFiledArrayPath<{foo: {bar: string[], baz: number[]}}> = 'foo.bar' | 'foo.baz'
 * ```
 */
type StringFiledArrayPath<TFieldValues extends FieldValues> = StringArrayPath<TFieldValues>;

type MultiTextInputRule = {
  required?: string;
  pattern?: {
    regex: RegExp;
    message: string;
  };
};

type MutiTextInputErrors = {
  inputs: Record<number, string | undefined>;
  required: string | undefined;
};

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends StringFiledArrayPath<TFieldValues> = StringFiledArrayPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: TName;
  rule?: MultiTextInputRule;
};

const MultiTextInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends StringFiledArrayPath<TFieldValues> = StringFiledArrayPath<TFieldValues>
>({
  control,
  name,
  rule,
}: Props<TFieldValues, TName>) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const [errors, setErrors] = useState<MutiTextInputErrors>({ inputs: {}, required: undefined });

  const validate = () => {
    const isValid = validateResult();

    if (!isValid) {
      setReferenceToInvalidInput();
    }

    return isValid;
  };

  const validateResult = () => {
    if (rule?.required && !validateRequired(fields)) {
      return false;
    }

    if (!rule) {
      return true;
    }

    return !Object.values(errors.inputs).some(Boolean);
  };

  const {
    field: { value, onChange, ref },
  } = useController({
    control,
    name: name as FieldPath<TFieldValues>,
    defaultValue: [] as UnpackNestedValue<PathValue<TFieldValues, Path<TFieldValues>>>,
    rules: {
      validate,
    },
  });

  const fields = useMemo(() => {
    if (value.length === 0) {
      return [''];
    }

    return value as string[];
  }, [value]);

  const validateRequired = (candidateValues: string[]) => {
    if (!rule?.required) {
      return true;
    }

    const containValue = candidateValues.some(Boolean);
    setErrors((preErros) => ({
      ...preErros,
      required: containValue ? undefined : rule.required ?? t('form.multi_text_input_required'),
    }));

    return containValue;
  };

  const validateInput = (index: number, input: string) => {
    if (!rule?.pattern) {
      return;
    }

    const { pattern } = rule;

    setErrors((preErrors) => ({
      ...preErrors,
      inputs: {
        ...preErrors.inputs,
        [index]: pattern.regex.test(input) ? undefined : pattern.message,
      },
    }));
  };

  const handleAdd = () => {
    onChange([...fields, '']);
  };

  const handleRemove = (index: number) => {
    if (errors.inputs[index]) {
      resetInputErrorAbove(index);
    }
    onChange(fields.filter((_, i) => i !== index));
  };

  const resetInputErrorAbove = (index: number) => {
    if (Object.prototype.hasOwnProperty.call(errors.inputs, index + 1)) {
      setErrors((preErrors) => ({
        required: preErrors.required,
        inputs: {
          ...preErrors.inputs,
          [index]: preErrors.inputs[index + 1],
          [index + 1]: undefined,
        },
      }));
      resetInputErrorAbove(index + 1);

      return;
    }
    setErrors((preErrors) => ({
      required: preErrors.required,
      inputs: {
        ...preErrors.inputs,
        [index]: undefined,
      },
    }));
  };

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>, index: number) => {
    validateInput(index, event.currentTarget.value);
    const candidateValues = fields.map((fieldValue, i) =>
      i === index ? event.currentTarget.value : fieldValue
    );
    onChange(candidateValues);
    validateRequired(candidateValues);
  };

  const inputReferences = useRef<Record<number, HTMLInputElement | undefined>>({});

  const setReferenceToInvalidInput = () => {
    if (rule?.required && !validateRequired(fields)) {
      ref(inputReferences.current[0]);

      return;
    }

    Object.entries(errors.inputs).find(([index, error]) => {
      if (error) {
        ref(inputReferences.current[Number(index)]);

        return true;
      }

      return false;
    });
  };

  return (
    <div className={styles.multilineInput}>
      {fields.map((fieldValue, fieldIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={fieldIndex}>
          <div className={styles.deletableInput}>
            <TextInput
              ref={(element) => {
                // eslint-disable-next-line @silverhand/fp/no-mutation
                inputReferences.current[fieldIndex] = element ?? undefined;
              }}
              hasError={Boolean(errors.inputs[fieldIndex] || (fieldIndex === 0 && errors.required))}
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
        {t('form.add_another')}
      </div>
    </div>
  );
};

export default MultiTextInput;
