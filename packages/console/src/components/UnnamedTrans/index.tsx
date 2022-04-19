import { Languages } from '@logto/phrases';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  resource: Record<Languages, string>;
  className?: string;
};

const UnnamedTrans = ({ resource, className }: Props) => {
  const {
    i18n: { languages },
  } = useTranslation();
  const matchedLanguage = languages.find((language) => resource[language]);

  if (!matchedLanguage) {
    return null;
  }

  return <span className={className}>{resource[matchedLanguage]}</span>;
};

export default UnnamedTrans;
