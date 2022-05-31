export const uriValidator = ({ allowBlank = true }) => {
  return (value: string) => {
    if (!allowBlank && value.trim().length === 0) {
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

export const uriOriginValidator = ({ allowBlank = true }) => {
  return (value: string) => {
    if (!allowBlank && value.trim().length === 0) {
      return true;
    }

    try {
      return new URL(value).origin === value;
    } catch {
      return false;
    }
  };
};
