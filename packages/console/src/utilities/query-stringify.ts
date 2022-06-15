// TODO - shared with ui/utilities/query-stringify.ts
export const queryStringify = (parameters: URLSearchParams | Record<string, string>) => {
  const searchParameters =
    parameters instanceof URLSearchParams ? parameters : new URLSearchParams(parameters);

  return searchParameters.toString();
};
