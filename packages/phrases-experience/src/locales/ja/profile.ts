const profile = {
  name: '名前',
  avatar: 'アバター',
  givenName: '名',
  familyName: '姓',
  middleName: 'ミドルネーム',
  fullname: 'フルネーム',
  nickname: 'ニックネーム',
  preferredUsername: '希望ユーザー名',
  profile: 'プロフィール',
  website: 'ウェブサイト',
  gender: '性別',
  birthdate: '生年月日',
  zoneinfo: 'タイムゾーン',
  locale: 'ロケール',
  address: {
    formatted: '住所',
    streetAddress: '番地',
    locality: '市区町村',
    region: '都道府県',
    postalCode: '郵便番号',
    country: '国',
  },
  gender_options: {
    female: '女性',
    male: '男性',
    prefer_not_to_say: '答えたくない',
  },
  checkbox_value: {
    checked: 'はい',
    unchecked: 'いいえ',
  },
  avatar_upload: {
    upload: 'アップロード',
    remove: '削除',
    uploading: 'アップロード中...',
    hint: '推奨サイズ 1:1、最大 {{limit}}。',
    error_file_type: 'ファイル形式は {{extensions}} である必要があります。',
    error_file_size: 'ファイルサイズは {{limit}} を超えられません。',
    error_upload: '写真のアップロードに失敗しました。もう一度お試しください。',
  },
};

export default Object.freeze(profile);
