export const uriValidator = (value: string) => {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    return false;
  }

  return true;
};

export const jsonValidator = (value: string) => {
  try {
    JSON.parse(value);
  } catch {
    return false;
  }

  return true;
};
