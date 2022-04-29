export const uriValidator = (verifyBlank = true) => {
  return (value: string) => {
    if (!verifyBlank && value.trim().length === 0) {
      return true;
    }

    try {
      // eslint-disable-next-line no-new
      new URL(value);
    } catch {
      return false;
    }

    return true;
  };
};
