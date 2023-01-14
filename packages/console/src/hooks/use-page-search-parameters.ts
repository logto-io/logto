import { conditional } from '@silverhand/essentials';

import useSearchParametersState from './use-search-parameters-state';

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
 * @returns [searchParams, updateSearchParams]
 */
const usePageSearchParameters = <T extends Parameters>(
  config: T
): UsePageSearchParametersReturn<T> => {
  const [searchParameters, setSearchParameters] = useSearchParametersState();

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
    (parameters: Partial<T>) => {
      setSearchParameters((previous) => {
        const baseParameters = new URLSearchParams(previous);

        for (const key of Object.keys(parameters)) {
          // eslint-disable-next-line no-restricted-syntax
          const value = parameters[key as keyof Partial<T>];

          if (value === undefined) {
            baseParameters.delete(key);
          } else {
            baseParameters.set(key, String(value));
          }
        }

        return baseParameters;
      });
    },
  ];
};

export default usePageSearchParameters;
