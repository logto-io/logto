import { useMemo, useState } from 'react';
import {
  Control,
  FieldPath,
  FieldValues,
  PathValue,
  UnpackNestedValue,
  useController,
  Path,
} from 'react-hook-form';

import { noSpaceRegex } from '@/utilities/regex';

import { MutiTextInputErrors, StringFiledArrayPath } from './type';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends StringFiledArrayPath<TFieldValues> = StringFiledArrayPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: TName;
};

function useMultiTextInputRhf<
  TFieldValues extends FieldValues = FieldValues,
  TName extends StringFiledArrayPath<TFieldValues> = StringFiledArrayPath<TFieldValues>
>({ control, name }: Props<TFieldValues, TName>) {
  const [errors, setErrors] = useState<MutiTextInputErrors>({});

  const validate = () => {
    console.log('validate multi text input');

    return !Object.values(errors).some(Boolean);
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

  const validateInput = (index: number, input: string) => {
    setErrors({
      ...errors,
      [index]: noSpaceRegex.test(input) ? undefined : 'space_not_allowed',
    });
  };

  const handleAdd = () => {
    onChange([...fields, '']);
  };

  const handleRemove = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>, index: number) => {
    validateInput(index, event.currentTarget.value);
    onChange(fields.map((value, i) => (i === index ? event.currentTarget.value : value)));
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
