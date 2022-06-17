import i18next from 'i18next';

export const translateUnnamed = (resource: Record<string, string>) => {
  const { languages } = i18next;
  const matchedLanguage = languages.find((language) => resource[language]);

  return (matchedLanguage && resource[matchedLanguage]) ?? 'Unknown';
};
