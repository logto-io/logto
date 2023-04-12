export const parsePhoneNumber = (phone: string) =>
  phone.replace(/[ ()-]/g, '').replace(/\+/g, '00');
