export const getBasename = (prefix: string, developmentPort: string): string => {
  const isBasenameNeeded =
    process.env.NODE_ENV !== 'development' || process.env.PORT === developmentPort;

  return isBasenameNeeded ? '/' + prefix : '';
};
