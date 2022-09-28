import en from '@logto/phrases-ui/lib/locales/en';

export const enTag = 'en';
export const trTrTag = 'tr-TR';
export const zhCnTag = 'zh-CN';
export const zhHkTag = 'zh-HK';

export const mockEnCustomPhrase = {
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
};

export const mockEnPhrase = {
  languageTag: enTag,
  translation: {
    ...en.translation,
    ...mockEnCustomPhrase.translation,
  },
};

export const mockTrTrCustomPhrase = {
  languageTag: trTrTag,
  translation: {
    input: {
      username: 'Kullanıcı Adı 1',
      password: 'Şifre 2',
      email: 'E-posta Adresi 3',
      phone_number: 'Telefon Numarası 4',
      confirm_password: 'Şifreyi Doğrula 5',
    },
  },
};

export const mockZhCnCustomPhrase = {
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
};

export const mockZhHkCustomPhrase = {
  languageTag: zhHkTag,
  translation: {
    input: {
      email: '郵箱 1',
      password: '密碼 2',
      username: '用戶名 3',
      phone_number: '手機號 4',
      confirm_password: '確認密碼 5',
    },
  },
};
