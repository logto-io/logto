export const formatNumberWithComma = (value: number): string =>
  value.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
