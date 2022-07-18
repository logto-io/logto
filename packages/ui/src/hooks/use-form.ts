import { useState, useCallback, useEffect, useRef, FormEvent } from 'react';

import { ErrorType } from '@/components/ErrorMessage';
import { entries, fromEntries, Entries } from '@/utils';

const useForm = <T extends Record<string, unknown>>(initialState: T) => {
  type ErrorState = {
    [key in keyof T]?: ErrorType;
  };

  type FieldValidations = {
    [key in keyof T]?: (value: T[key]) => ErrorType | undefined;
  };

  const [fieldValue, setFieldValue] = useState<T>(initialState);
  const [fieldErrors, setFieldErrors] = useState<ErrorState>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string>();

  const fieldValidationsRef = useRef<FieldValidations>({});

  const validateForm = useCallback(() => {
    const errors: Entries<ErrorState> = entries(fieldValue).map(([key, value]) => [
      key,
      fieldValidationsRef.current[key]?.(value),
    ]);

    setFieldErrors(fromEntries(errors));

    return errors.every(([, error]) => error === undefined);
  }, [fieldValidationsRef, fieldValue]);

  const register = useCallback(
    <K extends keyof T>(field: K, validation: (value: T[K]) => ErrorType | undefined) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      fieldValidationsRef.current[field] = validation;

      return {
        value: fieldValue[field],
        error: fieldErrors[field],
        onChange: ({ currentTarget: { value } }: FormEvent<HTMLInputElement>) => {
          setFieldValue((previous) => ({ ...previous, [field]: value }));
        },
      };
    },
    [fieldErrors, fieldValue]
  );

  // Revalidate on Input change
  useEffect(() => {
    setFieldErrors((previous) => {
      const errors: Entries<ErrorState> = entries(fieldValue).map(([key, value]) => [
        key,
        // Only validate field with existing errors
        previous[key] && fieldValidationsRef.current[key]?.(value),
      ]);

      return fromEntries(errors);
    });
  }, [fieldValue, fieldValidationsRef]);

  return {
    fieldValue,
    fieldErrors,
    formErrorMessage,
    validateForm,
    setFieldValue,
    setFieldErrors,
    setFormErrorMessage,
    register,
  };
};

export default useForm;
