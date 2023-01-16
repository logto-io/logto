export const stringifyError = (error: Error) =>
  JSON.stringify(error, Object.getOwnPropertyNames(error));
