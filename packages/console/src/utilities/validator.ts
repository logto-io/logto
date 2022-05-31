export const uriValidator = (verifyBlank = true, originOnly = false) => {
  return (value: string) => {
    if (!verifyBlank && value.trim().length === 0) {
      return true;
    }

    try {
      const uri = new URL(value);

      if (originOnly) {
        return uri.origin === value;
      }
    } catch {
      return false;
    }

    return true;
  };
};
