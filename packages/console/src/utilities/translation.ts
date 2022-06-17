import i18next from 'i18next';

export const translateUnnamed = (resource: Record<string, string>) => {
  const { languages } = i18next;
  const matchedLanguage = languages.find((language) => resource[language]);

  // Note: the `Unknown` string will not be returned in theory.
  return (matchedLanguage && resource[matchedLanguage]) ?? 'Unknown';
};
