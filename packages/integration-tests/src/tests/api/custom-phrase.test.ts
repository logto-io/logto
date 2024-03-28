import { HTTPError } from 'ky';

import {
  listCustomPhrases,
  getCustomPhrase,
  createOrUpdateCustomPhrase,
  deleteCustomPhrase,
} from '#src/api/custom-phrase.js';

const mockZhTranslation = {
  input: {
    email: '邮箱',
    password: '密码',
    username: '用户名',
    phone_number: '手机号码',
    confirm_password: '确认密码',
    search_region_code: '搜索区号',
  },
};

const mockZhTranslationUpdated = {
  ...mockZhTranslation,
  description: {
    email: '邮箱',
    phone_number: '手机号码',
  },
};

const mockEnUsTranslation = {
  input: {
    email: 'email',
    password: 'password',
    username: 'username',
    phone_number: 'phone_number',
    confirm_password: 'confirm password',
    search_region_code: 'search region code',
  },
};

describe('custom-phrase flow', () => {
  it('failed create a non built-in custom phrase with invalid language tag (zh-ZH)', async () => {
    await expect(createOrUpdateCustomPhrase('zh-ZH', mockZhTranslation)).rejects.toThrow(HTTPError);
  });

  it('create a non built-in custom phrase (zh)', async () => {
    await createOrUpdateCustomPhrase('zh', mockZhTranslation);
    const { translation: zhTranslation } = await getCustomPhrase('zh');
    expect(zhTranslation).toEqual(mockZhTranslation);
  });

  it('customize a built-in custom phrase (en-US)', async () => {
    await createOrUpdateCustomPhrase('en-US', mockEnUsTranslation);
    const { translation: enUsTranslation } = await getCustomPhrase('en-US');
    expect(enUsTranslation).toEqual(mockEnUsTranslation);
  });

  it('update an existing custom phrase', async () => {
    await createOrUpdateCustomPhrase('zh', mockZhTranslationUpdated);
    const { translation: zhTranslationNew } = await getCustomPhrase('zh');
    expect(zhTranslationNew).toEqual(mockZhTranslationUpdated);
  });

  it('fail to update an existing custom phrase with invalid translation keys', async () => {
    await expect(
      createOrUpdateCustomPhrase('zh', { ...mockZhTranslationUpdated, invalidKey: 'invalid value' })
    ).rejects.toThrow(HTTPError);
  });

  it('failed to get a custom phrase with invalid language tag (zh-ZH)', async () => {
    await expect(getCustomPhrase('zh-ZH')).rejects.toThrow(HTTPError);
  });

  it('failed to get a custom phrase with non-existing record', async () => {
    await expect(getCustomPhrase('zh-TW')).rejects.toThrow(HTTPError);
  });

  it('get all custom phrases', async () => {
    const allCustomPhrases = await listCustomPhrases();
    expect(allCustomPhrases.find(({ languageTag }) => languageTag === 'zh')?.translation).toEqual(
      mockZhTranslationUpdated
    );
    expect(
      allCustomPhrases.find(({ languageTag }) => languageTag === 'en-US')?.translation
    ).toEqual(mockEnUsTranslation);
  });

  it('failed to delete a custom phrase with invalid language tag (zh-ZH)', async () => {
    await expect(deleteCustomPhrase('zh-ZH')).rejects.toThrow(HTTPError);
  });

  it('failed to delete a custom phrase with non-existing record', async () => {
    await expect(deleteCustomPhrase('zh-TW')).rejects.toThrow(HTTPError);
  });

  it('fail to delete a custom phrase which has been set as fallback language', async () => {
    await expect(deleteCustomPhrase('en')).rejects.toThrow(HTTPError);
  });

  it('delete all custom phrases', async () => {
    await deleteCustomPhrase('zh');
    await deleteCustomPhrase('en-US');
    const allCustomPhrases = await listCustomPhrases();
    expect(allCustomPhrases.find(({ languageTag }) => languageTag === 'zh')).toBeUndefined();
    expect(allCustomPhrases.find(({ languageTag }) => languageTag === 'en-US')).toBeUndefined();
  });
});
