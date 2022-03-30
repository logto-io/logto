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
type StringFieldArrayPath<TFieldValues extends FieldValues> = StringArrayPath<TFieldValues>;

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
  TName extends StringFieldArrayPath<TFieldValues> = StringFieldArrayPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: TName;
  rule?: MultiTextInputRule;
};

const MultiTextInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends StringFieldArrayPath<TFieldValues> = StringFieldArrayPath<TFieldValues>
>({
  control,
  name,
  rule,
}: Props<TFieldValues, TName>) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const [errors, setErrors] = useState<MutiTextInputErrors>({ inputs: {}, required: undefined });
  const shouldValidate = useRef(false);

  const validate = () => {
    const isRequiredValid = validateRequired(fields);
    const isInputsValid = validateInputs(fields);

    const allValid = isRequiredValid && isInputsValid;

    if (!allValid) {
      setReferenceToInvalidInput(fields);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      shouldValidate.current = true;
    }

    return allValid;
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

  const validateInputs = (candidateValues: string[]) => {
    if (!rule?.pattern) {
      return true;
    }

    const { regex, message } = rule.pattern;

    for (const [index, value] of candidateValues.entries()) {
      const isValid = regex.test(value);
      setErrors((preErros) => ({
        ...preErros,
        inputs: {
          ...preErros.inputs,
          [index]: isValid ? undefined : message,
        },
      }));
    }

    const hasInvalidInput = candidateValues.some((element) => !regex.test(element));

    return !hasInvalidInput;
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
    const candidateValues = fields.map((fieldValue, i) =>
      i === index ? event.currentTarget.value : fieldValue
    );
    onChange(candidateValues);

    if (shouldValidate.current) {
      validateInputs(candidateValues);
      validateRequired(candidateValues);
    }
  };

  const inputReferences = useRef<Record<number, HTMLInputElement | undefined>>({});

  const setReferenceToInvalidInput = (candidateValues: string[]) => {
    ref(null);

    if (!validateRequired(candidateValues)) {
      ref(inputReferences.current[0]);

      return;
    }

    if (!rule?.pattern) {
      return;
    }

    if (!validateInputs(candidateValues)) {
      const errorIndex = candidateValues.findIndex(
        (candidateValue) => !rule.pattern?.regex.test(candidateValue)
      );

      if (errorIndex >= 0) {
        ref(inputReferences.current[errorIndex]);
      }
    }
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
