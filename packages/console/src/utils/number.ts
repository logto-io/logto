export const formatNumberWithComma = (value: number): string =>
  value.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatQuotaNumber = (number: number): string => {
  if (number >= 1e6) {
    return (number / 1e6).toFixed(1) + 'M';
  }

  if (number >= 1e3) {
    return (number / 1e3).toFixed(1) + 'K';
  }

  if (Number.isInteger(number)) {
    return number.toString();
  }

  return number.toFixed(2);
};
