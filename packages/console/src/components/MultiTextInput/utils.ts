import { conditional } from '@silverhand/essentials';

import { MultiTextInputError, MultiTextInputRule } from './types';

export const validate = (
  value: string[],
  rule?: MultiTextInputRule
): MultiTextInputError | undefined => {
  if (!rule) {
    return;
  }

  const requiredError = conditional(value.filter(Boolean).length === 0 && rule.required);

  if (requiredError) {
    return {
      required: requiredError,
    };
  }

  if (rule.pattern) {
    const { regex, message } = rule.pattern;

    const inputErrors = Object.fromEntries(
      value.map((element, index) => {
        return [index, regex.test(element) ? undefined : message];
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
  (value: string[]): boolean | string => {
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

  return JSON.parse(errorMessage) as MultiTextInputError;
};
