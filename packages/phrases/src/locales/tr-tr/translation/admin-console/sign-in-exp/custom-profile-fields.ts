const custom_profile_fields = {
  table: {
    add_button: 'Profil alanı ekle',
    title: {
      field_label: 'Alan etiketi',
      type: 'Tür',
      user_data_key: 'Kullanıcı veri anahtarı',
    },
    placeholder: {
      title: 'Kullanıcı profilini topla',
      description:
        'Kayıt sırasında daha fazla kullanıcı profili bilgisi toplamak için alanları özelleştirin.',
    },
  },
  type: {
    Text: 'Metin',
    Number: 'Sayı',
    Date: 'Tarih',
    Checkbox: 'Onay kutusu (Boolean)',
    Select: 'Açılır menü (Tek seçim)',
    Url: 'URL',
    Regex: 'Düzenli ifade',
    Address: 'Adres (Bileşim)',
    Fullname: 'Tam ad (Bileşim)',
  },
  modal: {
    title: 'Profil alanı ekle',
    subtitle:
      'Kayıt sırasında daha fazla kullanıcı profili bilgisi toplamak için alanları özelleştirin.',
    built_in_properties: 'Temel kullanıcı verileri',
    custom_properties: 'Özel kullanıcı verileri',
    custom_data_field_name: 'Kullanıcı veri anahtarı',
    custom_data_field_input_placeholder:
      'Kullanıcı veri anahtarını girin, örn. `myFavoriteFieldName`',
    custom_field: {
      title: 'Özel veriler',
      description:
        'Uygulamanızın benzersiz gereksinimlerini karşılamak için tanımlayabileceğiniz herhangi bir ek kullanıcı özelliği.',
    },
    type_required: 'Lütfen bir özellik türü seçin',
    create_button: 'Profil alanı oluştur',
  },
  details: {
    page_title: 'Profil alanı detayları',
    back_to_sie: 'Oturum açma deneyimine geri dön',
    enter_field_name: 'Profil alanı adını girin',
    delete_description:
      'Bu işlem geri alınamaz. Bu profil alanını silmek istediğinizden emin misiniz?',
    field_deleted: '{{name}} profil alanı başarıyla silindi.',
    key: 'Kullanıcı veri anahtarı',
    field_name: 'Alan adı',
    field_type: 'Alan türü',
    settings: 'Ayarlar',
    settings_description:
      'Kayıt sırasında daha fazla kullanıcı profili bilgisi toplamak için alanları özelleştirin.',
    address_format: 'Adres formatı',
    single_line_address: 'Tek satır adres',
    multi_line_address: 'Çok satırlı adres (Örn., Sokak, Şehir, Eyalet, Posta Kodu, Ülke)',
    components: 'Bileşenler',
    components_tip: 'Karmaşık alanı oluşturmak için bileşenleri seçin.',
    label: 'Alan etiketi',
    label_placeholder: 'Etiket',
    label_tip:
      'Yerelleştirme mi gerekiyor? <a>Oturum açma deneyimi > İçerik</a> bölümünden diller ekleyin',
    label_tooltip:
      'Alan amacını belirten kayan etiket. Giriş alanında görünür ve odaklandığında veya değer olduğunda yukarı taşınır.',
    placeholder: 'Alan yer tutucusu',
    placeholder_placeholder: 'Yer tutucu',
    placeholder_tooltip:
      'Giriş alanı içindeki satır içi örnek veya biçim ipucu. Genellikle etiket yukarı çıktıktan sonra görünür; kısa tutun (örn. GG/AA/YYYY).',
    description: 'Alan açıklaması',
    description_placeholder: 'Açıklama',
    description_tooltip:
      'Metin alanının altında gösterilen yardımcı metin. Daha uzun talimatlar veya erişilebilirlik notları için kullanın.',
    options: 'Seçenekler',
    options_tip:
      'Her seçeneği yeni bir satıra girin. Biçim: value:label (örn. red:Red). Sadece value da girebilirsiniz; label verilmezse value etiketi olarak gösterilir.',
    options_placeholder: 'değer1:etiket1\ndeğer2:etiket2\ndeğer3:etiket3',
    regex: 'Düzenli ifade',
    regex_tip: 'Girdiyi doğrulamak için bir düzenli ifade tanımlayın.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Tarih formatı',
    date_format_us: 'MM/dd/yyyy (örn. Amerika Birleşik Devletleri)',
    date_format_uk: 'dd/MM/yyyy (örn. İngiltere ve Avrupa)',
    date_format_iso: 'yyyy-MM-dd (Uluslararası standart)',
    custom_date_format: 'Özel tarih formatı',
    custom_date_format_placeholder: 'Özel tarih formatını girin. Örn. "MM-dd-yyyy"',
    custom_date_format_tip:
      'Geçerli biçimlendirme belirteçleri için <a>date-fns</a> dokümanlarına bakın.',
    input_length: 'Girdi uzunluğu',
    value_range: 'Değer aralığı',
    min: 'Minimum',
    max: 'Maksimum',
    default_value: 'Varsayılan değer',
    checkbox_checked: 'İşaretli (True)',
    checkbox_unchecked: 'İşaretsiz (False)',
    required: 'Zorunlu',
    required_description:
      'Etkinleştirildiğinde, bu alan kullanıcılar tarafından doldurulmalıdır. Devre dışı bırakıldığında, bu alan isteğe bağlıdır.',
  },
};

export default Object.freeze(custom_profile_fields);
