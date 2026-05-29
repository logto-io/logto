const profile = {
  name: 'İsim',
  avatar: 'Avatar',
  givenName: 'Ad',
  familyName: 'Soyad',
  middleName: 'İkinci Ad',
  fullname: 'Tam Ad',
  nickname: 'Takma Ad',
  preferredUsername: 'Tercih Edilen Kullanıcı Adı',
  profile: 'Profil',
  website: 'Web Sitesi',
  gender: 'Cinsiyet',
  birthdate: 'Doğum Tarihi',
  zoneinfo: 'Zaman Dilimi',
  locale: 'Dil',
  address: {
    formatted: 'Adres',
    streetAddress: 'Sokak adresi',
    locality: 'Şehir',
    region: 'Eyalet/İl',
    postalCode: 'Posta kodu',
    country: 'Ülke',
  },
  gender_options: {
    female: 'Kadın',
    male: 'Erkek',
    prefer_not_to_say: 'Söylememeyi tercih ederim',
  },
  checkbox_value: {
    checked: 'Evet',
    unchecked: 'Hayır',
  },
  avatar_upload: {
    upload: 'Yükle',
    remove: 'Kaldır',
    uploading: 'Yükleniyor...',
    hint: 'Önerilen boyut 1:1, en fazla {{limit}}.',
    error_file_type: 'Dosya türü {{extensions}} olmalıdır.',
    error_file_size: 'Dosya boyutu {{limit}} değerini aşmamalıdır.',
    error_upload: 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.',
  },
};

export default Object.freeze(profile);
