export const maskUserInfo = ({ type, value }: { type: 'email' | 'phone'; value: string }) => {
  if (!value) {
    return value;
  }

  if (type === 'phone') {
    return `****${value.slice(-4)}`;
  }

  const [name = '', domain = ''] = value.split('@');

  const preview = name.length > 4 ? `${name.slice(0, 4)}` : '';

  return `${preview}****@${domain}`;
};

export const stringifyError = (error: Error) =>
  JSON.stringify(error, Object.getOwnPropertyNames(error));
