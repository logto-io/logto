import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import zhCN from '@/locales/zh-CN.json';

const initI18n = () => {
  void i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      resources: {
        en,
        'zh-CN': zhCN,
      },
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

export default initI18n;
