import { Languages } from '@logto/phrases';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  resource: Record<Languages, string>;
};

const UnnamedTrans = ({ resource }: Props) => {
  const {
    i18n: { languages },
  } = useTranslation();
  const matchedLanguage = languages.find((language) => resource[language]);

  if (!matchedLanguage) {
    return null;
  }

  return <span>{resource[matchedLanguage]}</span>;
};

export default UnnamedTrans;
