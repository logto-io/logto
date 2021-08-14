import en from './locales/en';
import zhCN from './locales/zh-cn';
import { Normalize, Resource } from './types';

export type LogtoErrorCode = Normalize<typeof en.errors>;
export type LogtoErrorI18nKey = `errors:${LogtoErrorCode}`;

const resource: Resource = {
  en,
  'zh-CN': zhCN,
};

export default resource;
