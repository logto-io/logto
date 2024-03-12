export const enumFromStringValue = <T extends Record<string, string>, K extends keyof T>(
  enumObject: T,
  value: string
): T[keyof T] | undefined =>
  enumObject[
    Object.keys(enumObject).find(
      // eslint-disable-next-line no-restricted-syntax
      (k) => enumObject[k as K].toString() === value
    ) as keyof typeof enumObject
  ];
