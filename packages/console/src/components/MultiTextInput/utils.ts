import { t } from 'i18next';

import { MultiTextInputError, multiTextInputErrorGuard, MultiTextInputRule } from './types';

export const validate = (
  value?: string[],
  rule?: MultiTextInputRule
): MultiTextInputError | undefined => {
  if (!rule) {
    return;
  }

  if (!value?.filter(Boolean).length) {
    if (!rule.required) {
      return;
    }

    return {
      required: rule.required,
    };
  }

  if (rule.pattern) {
    const { verify, message } = rule.pattern;

    const inputErrors = Object.fromEntries(
      value.map((element, index) => {
        return [index, verify(element) ? undefined : message];
      })
    );

    if (Object.values(inputErrors).some(Boolean)) {
      return {
        inputs: inputErrors,
      };
    }
  }
};

/**
 * Utils for React Hook Form
 */
export const createValidatorForRhf =
  (rule: MultiTextInputRule) =>
  (value?: string[]): boolean | string => {
    const error = validate(value, rule);

    if (error) {
      return JSON.stringify(error);
    }

    return true;
  };

export const convertRhfErrorMessage = (errorMessage?: string): MultiTextInputError | undefined => {
  if (!errorMessage) {
    return;
  }

  const result = multiTextInputErrorGuard.safeParse(errorMessage);

  if (!result.success) {
    throw new Error(t('admin_console.errors.invalid_error_message_format'));
  }

  return result.data;
};
