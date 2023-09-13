const password_policy = {
  password_requirements: 'Parola gereksinimleri',
  minimum_length: 'Minimum uzunluk',
  minimum_length_description:
    'NIST önerilerine göre, web ürünleri için en az <a>8 karakter</a> kullanın.',
  minimum_length_error: 'Minimum uzunluk {{min}} ile {{max}} (dahil) arasında olmalıdır.',
  minimum_required_char_types: 'Minimum gereken karakter tipleri',
  minimum_required_char_types_description:
    'Karakter tipleri: büyük harfler (A-Z), küçük harfler (a-z), sayılar (0-9) ve özel semboller ({{symbols}}).',
  password_rejection: 'Parola reddi',
  compromised_passwords: 'Etkilenen şifreleri reddet',
  breached_passwords: 'Veri tabanında yer alan şifreleri reddet',
  breached_passwords_description: 'Daha önceki ihlal veritabanlarında bulunan şifreleri reddet.',
  restricted_phrases: 'Düşük güvenlikli ifadeleri kısıtla',
  restricted_phrases_tooltip:
    'Parolanız 3 ya da daha fazla karakterle birleştirilmediği sürece bu ifadelerden kaçınmalıdır.',
  repetitive_or_sequential_characters: 'Tekrarlayan veya ardışık karakterler',
  repetitive_or_sequential_characters_description: 'Örn., "AAAA", "1234" ve "abcd".',
  user_information: 'Kullanıcı bilgisi',
  user_information_description: 'Örn., e-posta adresi, telefon numarası, kullanıcı adı vb.',
  custom_words: 'Özel kelimeler',
  custom_words_description:
    'Bağlamla ilgili kelimeleri kişiselleştirin, küçük/büyük harf duyarsız ve satır başına bir kelime olacak şekilde.',
  custom_words_placeholder: 'Servis adınız, şirket adınız, vb.',
};

export default Object.freeze(password_policy);
