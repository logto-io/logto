export const maskUserInfo = ({
  type,
  value,
}: {
  type: 'email' | 'phone' | 'username';
  value: string;
}) => {
  if (!value) {
    return value;
  }

  if (type === 'phone') {
    return `****${value.slice(-4)}`;
  }

  if (type === 'username') {
    return `****${value.slice(-2)}`;
  }

  const [name = '', domain = ''] = value.split('@');

  const preview = name.length > 4 ? `${name.slice(0, 4)}` : '';

  return `${preview}****@${domain}`;
};
