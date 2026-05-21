import {
  normalizeCustomUiCspSourceExpression as normalizeCustomUiCspSourceExpressionBase,
  type CustomUiCspDirective,
} from '@logto/core-kit';

type ValidationOptions = {
  readonly isProductionEnv?: boolean;
};

type ValidationMessages = {
  readonly duplicate: string;
  readonly invalid: string;
};

export const normalizeCustomUiCspSourceExpression = (
  directive: CustomUiCspDirective,
  rawSource: string,
  { isProductionEnv = false }: ValidationOptions = {}
): string | false | undefined => {
  const source = rawSource.trim();

  if (!source) {
    return;
  }

  const result = normalizeCustomUiCspSourceExpressionBase(directive, source, {
    isProduction: isProductionEnv,
  });

  return result.isValid ? result.value : false;
};

export const createCustomUiCspValidator =
  (directive: CustomUiCspDirective, messages: ValidationMessages, options?: ValidationOptions) =>
  (sources?: string[]): boolean | string => {
    const { inputErrors } = (sources ?? []).reduce<{
      readonly inputErrors: Record<number, string | undefined>;
      readonly seenSources: ReadonlySet<string>;
    }>(
      ({ inputErrors, seenSources }, source, index) => {
        const normalizedSource = normalizeCustomUiCspSourceExpression(directive, source, options);

        if (normalizedSource === false) {
          return {
            inputErrors: {
              ...inputErrors,
              [index]: messages.invalid,
            },
            seenSources,
          };
        }

        if (!normalizedSource) {
          return { inputErrors, seenSources };
        }

        if (seenSources.has(normalizedSource)) {
          return {
            inputErrors: {
              ...inputErrors,
              [index]: messages.duplicate,
            },
            seenSources,
          };
        }

        return {
          inputErrors,
          seenSources: new Set([...seenSources, normalizedSource]),
        };
      },
      { inputErrors: {}, seenSources: new Set() }
    );

    if (Object.values(inputErrors).some(Boolean)) {
      return JSON.stringify({ inputs: inputErrors });
    }

    return true;
  };
