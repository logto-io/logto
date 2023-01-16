import { conditional } from '@silverhand/essentials';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

type Parameters = Record<string, string | number>;

type UsePageSearchParametersReturn<T extends Parameters = Parameters> = [
  {
    [K in keyof T]: T[K];
  },
  (parameters: Partial<T>) => void
];

/**
 * Manage page search parameters
 *
 * @param config Define search parameter keys and their default value. E.g., `{ page: 1, keyword: '' }`
 * @returns [pageSearchParams, updatePageSearchParams]
 */
const usePageSearchParameters = <T extends Parameters>(
  config: T
): UsePageSearchParametersReturn<T> => {
  const [searchParameters, setSearchParameters] = useSearchParams();

  const updatePageSearchParameters = useCallback(
    (parameters: Partial<T>) => {
      const baseParameters = new URLSearchParams(searchParameters);

      for (const key of Object.keys(parameters)) {
        // eslint-disable-next-line no-restricted-syntax
        const value = parameters[key as keyof Partial<T>];

        if (value === undefined) {
          baseParameters.delete(key);
        } else {
          baseParameters.set(key, String(value));
        }
      }

      setSearchParameters(baseParameters);
    },
    [searchParameters, setSearchParameters]
  );

  return [
    // eslint-disable-next-line no-restricted-syntax
    Object.fromEntries(
      Object.entries(config).map(([parameterKey, defaultValue]) => {
        const locationParameterValue = searchParameters.get(parameterKey);
        const parameterValue =
          typeof defaultValue === 'string'
            ? locationParameterValue ?? defaultValue
            : conditional(locationParameterValue && Number(locationParameterValue)) ?? defaultValue;

        return [parameterKey, parameterValue];
      })
    ) as UsePageSearchParametersReturn<T>[0],
    updatePageSearchParameters,
  ];
};

export default usePageSearchParameters;
