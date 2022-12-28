export const maskUserInfo = (info: { type: 'email' | 'phone'; value: string }) => {
  const { type, value } = info;

  if (!value) {
    return info;
  }

  if (type === 'phone') {
    return {
      type,
      value: `****${value.slice(-4)}`,
    };
  }

  // Email
  const [name = '', domain = ''] = value.split('@');

  const preview = name.length > 4 ? `${name.slice(0, 4)}` : '';

  return {
    type,
    value: `${preview}****@${domain}`,
  };
};

export const stringifyError = (error: Error) =>
  JSON.stringify(error, Object.getOwnPropertyNames(error));
