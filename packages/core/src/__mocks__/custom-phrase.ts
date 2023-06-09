import { type CustomPhrase } from '@logto/schemas';

import { mockId } from '#src/test-utils/nanoid.js';

export const enTag = 'en';
export const trTrTag = 'tr-TR';
export const zhCnTag = 'zh-CN';
export const mockTag = 'fo-BA';

export const mockEnCustomPhrase = {
  tenantId: 'fake_tenant',
  id: mockId,
  languageTag: enTag,
  translation: {
    input: {
      username: 'Username 1',
      password: 'Password 2',
      email: 'Email 3',
      phone_number: 'Phone number 4',
      confirm_password: 'Confirm password 5',
    },
  },
} satisfies CustomPhrase;

export const mockZhCnCustomPhrase = {
  tenantId: 'fake_tenant',
  id: mockId,
  languageTag: zhCnTag,
  translation: {
    input: {
      username: '用户名 1',
      password: '密码 2',
      email: '邮箱 3',
      phone_number: '手机号 4',
      confirm_password: '确认密码 5',
    },
  },
} satisfies CustomPhrase;

export const mockZhHkCustomPhrase = {
  tenantId: 'fake_tenant',
  id: mockId,
  languageTag: mockTag,
  translation: {
    input: {
      email: '郵箱 1',
      password: '密碼 2',
      username: '用戶名 3',
      phone_number: '手機號 4',
      confirm_password: '確認密碼 5',
    },
  },
} satisfies CustomPhrase;
