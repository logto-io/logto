import en from '@logto/phrases-ui/lib/locales/en';

export const enKey = 'en';
export const koKrKey = 'ko-KR';
export const trTrKey = 'tr-TR';
export const zhCnKey = 'zh-CN';
export const zhHkKey = 'zh-HK';

export const mockEnCustomPhrase = {
  languageKey: enKey,
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
  languageKey: enKey,
  translation: {
    ...en.translation,
    ...mockEnCustomPhrase.translation,
  },
};

export const mockTrTrCustomPhrase = {
  languageKey: trTrKey,
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
  languageKey: zhCnKey,
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
  languageKey: zhHkKey,
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
