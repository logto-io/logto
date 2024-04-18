import { useTranslation } from 'react-i18next';

type Props = {
  readonly resource: Record<string, string>;
  readonly className?: string;
};

function UnnamedTrans({ resource, className }: Props) {
  const {
    i18n: { languages },
  } = useTranslation();
  const matchedLanguage = languages.find((language) => resource[language]);

  if (!matchedLanguage) {
    return null;
  }

  return <span className={className}>{resource[matchedLanguage]}</span>;
}

export default UnnamedTrans;
