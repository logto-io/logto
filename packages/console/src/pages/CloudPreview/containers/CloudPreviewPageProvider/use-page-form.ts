import type { Control, FieldValues, UseFormHandleSubmit } from 'react-hook-form';
import { useForm } from 'react-hook-form';

export type PageForm<T extends FieldValues> = {
  isSubmitting: boolean;
  isValid: boolean;
  getControl: () => Control<T>;
  getSubmitHandler: () => UseFormHandleSubmit<T>;
};

const usePageForm = <T extends FieldValues>(): PageForm<T> => {
  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
    control,
  } = useForm<T>({ mode: 'onChange' });

  return {
    isSubmitting,
    isValid,
    getControl: () => control,
    getSubmitHandler: () => handleSubmit,
  };
};

export default usePageForm;
