import i18next from 'i18next';

export const translateUnnamed = (resource: Record<string, string>) => {
  const { languages } = i18next;
  const matchedTranslation = languages.find((language) => resource[language]);

  return matchedTranslation && resource[matchedTranslation];
};
