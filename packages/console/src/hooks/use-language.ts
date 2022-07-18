import { Language } from '@logto/phrases';
import { useTranslation } from 'react-i18next';

const useLanguage = () => {
  const {
    i18n: { language },
  } = useTranslation();

  return Object.values<string>(Language).includes(language) ? language : Language.English;
};

export default useLanguage;
