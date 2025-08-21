export const maskEmail = (email: string) => {
  const [name = '', domain = ''] = email.split('@');
  const preview = name.length > 4 ? `${name.slice(0, 4)}` : '';
  return `${preview}****@${domain}`;
};

export const maskPhone = (phone: string) => `****${phone.slice(-4)}`;

export default Object.freeze({ maskEmail, maskPhone });
