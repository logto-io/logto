export const getBasename = (): string => {
  const isBasenameNeeded = process.env.NODE_ENV !== 'development' || process.env.PORT === '5002';

  return isBasenameNeeded ? '/console' : '';
};
