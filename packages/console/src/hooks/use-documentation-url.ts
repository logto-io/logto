import { appendPath } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';

/**
 * Supported languages on https://docs.meshx.io
 */
enum DocumentationLanguage {
  English = 'en',
}

const documentationSiteRoot = 'https://docs.meshx.io';

const useDocumentationUrl = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const documentationSiteUrl = Object.values<string>(DocumentationLanguage)
    .filter((language) => language !== DocumentationLanguage.English)
    .includes(language)
    ? `${documentationSiteRoot}/${language.toLocaleLowerCase()}`
    : documentationSiteRoot;

  return {
    documentationSiteUrl,
    getDocumentationUrl: (pagePath: string) =>
      appendPath(new URL(documentationSiteUrl), pagePath).toString(),
  };
};

export default useDocumentationUrl;
