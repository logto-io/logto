import { Gender } from '@logto/schemas';

type Translate = (key: string) => string;

const isGenderOptionKey = (key: string): key is Gender =>
  Object.values<string>(Gender).includes(key);

export const getSelectOptionLabel = (
  value: string,
  label: string | undefined,
  translate: Translate
) => {
  if (!label && isGenderOptionKey(value)) {
    return translate(`profile.gender_options.${value}`);
  }

  return label ?? value;
};
