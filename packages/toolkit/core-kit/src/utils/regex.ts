export const isValidRegEx = (regEx?: string) => {
  try {
    return Boolean(regEx && new RegExp(regEx));
  } catch {
    return false;
  }
};
