import { useTranslation } from 'react-i18next';

/**
 * Supported languages on https://docs.logto.io
 */
enum DocumentationLanguage {
  English = 'en',
  Chinese = 'zh-CN',
}

const documentationSiteUrl = 'https://docs.logto.io';

const useDocumentationUrl = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const documentationUrl = Object.values<string>(DocumentationLanguage)
    .filter((language) => language !== DocumentationLanguage.English)
    .includes(language)
    ? `${documentationSiteUrl}/${language.toLocaleLowerCase()}`
    : documentationSiteUrl;

  return documentationUrl;
};

export default useDocumentationUrl;
