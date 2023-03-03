export const throwNotLoadedError = () => {
  throw new Error(
    'The env set is not loaded. Make sure to call `await envSet.load()` before using it.'
  );
};
