export const uriValidator = (value: string) => {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    return false;
  }

  return true;
};

export const uriOriginValidator = (value: string) => {
  try {
    return new URL(value).origin === value;
  } catch {
    return false;
  }
};
