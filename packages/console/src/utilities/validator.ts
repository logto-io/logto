export const uriValidator = ({ verifyBlank = true }) => {
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

export const uriOriginValidator = ({ verifyBlank = true }) => {
  return (value: string) => {
    if (!verifyBlank && value.trim().length === 0) {
      return true;
    }

    try {
      return new URL(value).origin === value;
    } catch {
      return false;
    }
  };
};
