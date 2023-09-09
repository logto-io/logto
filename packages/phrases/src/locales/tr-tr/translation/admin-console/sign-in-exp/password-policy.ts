const password_policy = {
  password_requirements: 'Şifre gereksinimleri',
  minimum_length: 'Minimum uzunluk',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: 'Minimum uzunluk {{min}} ile {{max}} (dahil) arasında olmalıdır.',
  minimum_required_char_types: 'Minimum gereken karakter tipleri',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'Parola reddi',
  compromised_passwords: 'Etkilenen şifreleri reddet',
  breached_passwords: 'Veri tabanında yer alan şifreleri reddet',
  breached_passwords_description: 'Daha önceki ihlal veritabanlarında bulunan şifreleri reddet.',
  restricted_phrases: 'Düşük güvenlikli ifadeleri kısıtla',
  restricted_phrases_tooltip:
    'Kullanıcılar aşağıda listelenen ifadelerin tam olarak aynısı veya tamamı tarafından oluşturulmuş parolaları kullanamazlar. Parola karmaşıklığını artırmak için 3 veya daha fazla aralıksız karakter eklemek izin verilir.',
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
