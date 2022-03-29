import { useMemo, useState } from 'react';
import {
  FieldPath,
  FieldValues,
  PathValue,
  UnpackNestedValue,
  useController,
  Path,
} from 'react-hook-form';

import {
  MutiTextInputErrors,
  StringFiledArrayPath,
  UseMultiTextInputRhfProps,
  UseMultiTextInputRhfReturn,
} from './type';

function useMultiTextInputRhf<
  TFieldValues extends FieldValues = FieldValues,
  TName extends StringFiledArrayPath<TFieldValues> = StringFiledArrayPath<TFieldValues>
>({
  control,
  name,
  rule: {
    required: requiredRule = {
      isRequred: false,
      message: '',
    },
    inputs: inputsRule,
  },
}: UseMultiTextInputRhfProps<TFieldValues, TName>): UseMultiTextInputRhfReturn {
  const [errors, setErrors] = useState<MutiTextInputErrors>({ inputs: {}, required: undefined });

  const validate = () => {
    if (requiredRule.isRequred && !validateRequired(fields)) {
      return false;
    }

    if (!inputsRule) {
      return true;
    }

    return !Object.values(errors.inputs).some(Boolean);
  };

  const {
    field: { value, onChange },
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
    if (!requiredRule.isRequred) {
      return true;
    }

    const containValue = candidateValues.some(Boolean);
    setErrors((preErros) => ({
      ...preErros,
      required: containValue ? undefined : requiredRule.message,
    }));

    return containValue;
  };

  const validateInput = (index: number, input: string) => {
    if (!inputsRule) {
      return;
    }

    setErrors((preErrors) => ({
      ...preErrors,
      inputs: {
        ...preErrors.inputs,
        [index]: inputsRule.pattern.test(input) ? undefined : inputsRule.message,
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

  return {
    fields,
    errors,
    validate,
    handleAdd,
    handleRemove,
    handleInputChange,
  };
}

export default useMultiTextInputRhf;
