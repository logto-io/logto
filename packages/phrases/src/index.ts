import { NormalizeKeyPaths } from '@silverhand/essentials';

import en from './locales/en';
import zhCN from './locales/zh-cn';
import { Resource } from './types';

export type LogtoErrorCode = NormalizeKeyPaths<typeof en.errors>;
export type LogtoErrorI18nKey = `errors:${LogtoErrorCode}`;
export type Languages = keyof Resource;
export type I18nKey = NormalizeKeyPaths<typeof en.translation>;
export type AdminConsoleKey = NormalizeKeyPaths<typeof en.translation.admin_console>;

export enum Language {
  English = 'en',
  Chinese = 'zh-CN',
}

const resource: Resource = {
  [Language.English]: en,
  [Language.Chinese]: zhCN,
};

export default resource;
