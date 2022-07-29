import { useTranslation } from 'react-i18next';

/**
 * Supported languages on https://doc.logto.io
 */
enum DocumentationLanguage {
  English = 'en',
  Chinese = 'zh-CN',
}

const useDocumentationLocale = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const documentationLocale = Object.values<string>(DocumentationLanguage)
    .filter((language) => language !== DocumentationLanguage.English)
    .includes(language)
    ? `/${language.toLocaleLowerCase()}`
    : '';

  return documentationLocale;
};

export default useDocumentationLocale;
