const profile = {
  page_title: 'Hesap Ayarları',
  title: 'Hesap Ayarları',
  description:
    'Hesap güvenliğinizi sağlamak için hesap ayarlarınızı değiştirin ve kişisel bilgilerinizi yönetin.',
  settings: {
    title: 'PROFİL AYARLARI',
    profile_information: 'Profil bilgisi',
    avatar: 'Avatar',
    name: 'İsim',
    username: 'Kullanıcı adı',
  },
  link_account: {
    title: 'HESABI BAĞLA',
    email_sign_in: 'E-posta ile giriş',
    email: 'E-posta',
    social_sign_in: 'Sosyal medya hesabıyla giriş',
    link_email: 'E-postayı bağla',
    link_email_subtitle:
      'Giriş yapmak veya hesap kurtarımında yardımcı olmak için e-postanızı bağlayın.',
    email_required: 'E-posta gerekli',
    invalid_email: 'Geçersiz e-posta adresi',
    identical_email_address: 'Girilen e-posta adresi mevcut olanla aynı',
    anonymous: 'Anonim',
  },
  password: {
    title: 'ŞİFRE VE GÜVENLİK',
    password: 'Şifre',
    password_setting: 'Şifre ayarları',
    new_password: 'Yeni şifre',
    confirm_password: 'Şifreyi onayla',
    enter_password: 'Geçerli şifreyi girin',
    enter_password_subtitle:
      'Hesap güvenliğinizi korumak için kendinizi doğrulayın. Değiştirmeden önce lütfen mevcut şifrenizi girin.',
    set_password: 'Şifre oluştur',
    verify_via_password: 'Şifre ile doğrula',
    show_password: 'Şifreyi göster',
    required: 'Şifre gerekli',
    do_not_match: 'Şifreler eşleşmiyor. Tekrar deneyin.',
  },
  code: {
    enter_verification_code: 'Doğrulama kodu girin',
    enter_verification_code_subtitle:
      'Doğrulama kodu, <strong>{{target}}</strong> adresine gönderildi.',
    verify_via_code: 'Doğrulama kodu ile doğrula',
    resend: 'Doğrulama kodunu tekrar gönder',
    resend_countdown: '{{countdown}} saniye içinde tekrar gönder',
  },
  delete_account: {
    title: 'HESABI SİL',
    label: 'Hesabı sil',
    description:
      'Hesabınızın tüm kişisel bilgileri, kullanıcı verileri ve yapılandırması silinecektir. Bu işlem geri alınamaz.',
    button: 'Hesabı sil',
    p: {
      has_issue:
        'Hesabını silmek istediğini duyduğumuza üzüldük. Hesabını silmeden önce aşağıdaki sorunları çözmen gerekiyor.',
      after_resolved:
        'Sorunları çözdükten sonra hesabını silebilirsin. Yardıma ihtiyacın olursa bizimle iletişime geçmekten çekinme.',
      check_information:
        'Hesabını silmek istediğini duyduğumuza üzüldük. Devam etmeden önce lütfen aşağıdaki bilgileri dikkatlice kontrol et.',
      remove_all_data:
        "Hesabını silmek, Logto Cloud'daki tüm verilerini kalıcı olarak silecektir. Bu yüzden devam etmeden önce önemli verilerini yedeklediğinden emin ol.",
      confirm_information:
        'Yukarıdaki bilgilerin beklediğin gibi olduğunu onayla. Hesabını sildiğinde, onu geri getiremeyeceğiz.',
      has_admin_role:
        'Aşağıdaki kiracıda yönetici rolün olduğundan, bu kiracı hesapla birlikte silinecektir:',
      has_admin_role_other:
        'Aşağıdaki kiracılarda yönetici rolün olduğundan, bu kiracılar hesapla birlikte silinecektir:',
      quit_tenant: 'Aşağıdaki kiracıdan çıkmak üzeresin:',
      quit_tenant_other: 'Aşağıdaki kiracılardan çıkmak üzeresin:',
    },
    issues: {
      paid_plan: 'Aşağıdaki kiracıda ücretli bir plan var, lütfen önce aboneliği iptal et:',
      paid_plan_other:
        'Aşağıdaki kiracılarda ücretli planlar var, lütfen önce abonelikleri iptal et:',
      subscription_status: 'Aşağıdaki kiracının abonelik durumu sorunlu:',
      subscription_status_other: 'Aşağıdaki kiracıların abonelik durumu sorunlu:',
      open_invoice: 'Aşağıdaki kiracının açık faturası var:',
      open_invoice_other: 'Aşağıdaki kiracıların açık faturaları var:',
    },
    error_occurred: 'Bir hata oluştu',
    error_occurred_description: 'Üzgünüz, hesabınızı silerken bir şeyler ters gitti:',
    request_id: 'İstek Kimliği: {{requestId}}',
    try_again_later:
      'Lütfen daha sonra tekrar deneyin. Sorun devam ederse, lütfen istek kimliğiyle Logto ekibiyle iletişime geçin.',
    final_confirmation: 'Nihai onay',
    about_to_start_deletion: 'Silme işlemine başlamak üzeresiniz ve bu işlem geri alınamaz.',
    permanently_delete: 'Kalıcı olarak sil',
  },
  set: 'Ayarla',
  change: 'Değiştir',
  link: 'Bağla',
  unlink: 'Bağlantıyı kes',
  not_set: 'Belirtilmemiş',
  change_avatar: 'Avatarı değiştir',
  change_name: 'İsmi değiştir',
  change_username: 'Kullanıcı adını değiştir',
  set_name: 'İsmi ayarla',
  email_changed: 'E-posta değiştirildi.',
  password_changed: 'Şifre değiştirildi.',
  updated: '{{target}} güncellendi.',
  linked: '{{target}} bağlandı.',
  unlinked: '{{target}} bağlantısı kesildi.',
  email_exists_reminder:
    'Bu e-posta {{email}}, mevcut bir hesapla ilişkilendirilmiştir. Başka bir e-posta bağlayın.',
  unlink_confirm_text: 'Evet, bağlantıyı kes',
  unlink_reminder:
    'Bağlantıyı keserseniz, kullanıcılar <span></span> hesabıyla giriş yapamazlar. Devam etmek istediğinizden emin misiniz?',
  fields: {
    /** UNTRANSLATED */
    name: 'Name',
    /** UNTRANSLATED */
    name_description:
      "The user's full name in displayable form including all name parts (e.g., “Jane Doe”).",
    /** UNTRANSLATED */
    avatar: 'Avatar',
    /** UNTRANSLATED */
    avatar_description: "URL of the user's avatar image.",
    /** UNTRANSLATED */
    familyName: 'Family name',
    /** UNTRANSLATED */
    familyName_description: 'The user\'s surname(s) or last name(s) (e.g., "Doe").',
    /** UNTRANSLATED */
    givenName: 'Given name',
    /** UNTRANSLATED */
    givenName_description: 'The user\'s given name(s) or first name(s) (e.g., "Jane").',
    /** UNTRANSLATED */
    middleName: 'Middle name',
    /** UNTRANSLATED */
    middleName_description: 'The user\'s middle name(s) (e.g., "Marie").',
    /** UNTRANSLATED */
    nickname: 'Nickname',
    /** UNTRANSLATED */
    nickname_description:
      'Casual or familiar name for the user, which may differ from their legal name.',
    /** UNTRANSLATED */
    preferredUsername: 'Preferred username',
    /** UNTRANSLATED */
    preferredUsername_description:
      'Shorthand identifier by which the user wishes to be referenced.',
    /** UNTRANSLATED */
    profile: 'Profile',
    /** UNTRANSLATED */
    profile_description:
      "URL of the user's human-readable profile page (e.g., social media profile).",
    /** UNTRANSLATED */
    website: 'Website',
    /** UNTRANSLATED */
    website_description: "URL of the user's personal website or blog.",
    /** UNTRANSLATED */
    gender: 'Gender',
    /** UNTRANSLATED */
    gender_description: 'The user\'s self-identified gender (e.g., "Female", "Male", "Non-binary")',
    /** UNTRANSLATED */
    birthdate: 'Birthdate',
    /** UNTRANSLATED */
    birthdate_description: 'The user\'s date of birth in a specified format (e.g., "MM-dd-yyyy").',
    /** UNTRANSLATED */
    zoneinfo: 'Timezone',
    /** UNTRANSLATED */
    zoneinfo_description:
      'The user\'s timezone in IANA format (e.g., "America/New_York" or "Europe/Paris").',
    /** UNTRANSLATED */
    locale: 'Language',
    /** UNTRANSLATED */
    locale_description: 'The user\'s language in IETF BCP 47 format (e.g., "en-US" or "zh-CN").',
    address: {
      /** UNTRANSLATED */
      formatted: 'Address',
      /** UNTRANSLATED */
      streetAddress: 'Street address',
      /** UNTRANSLATED */
      locality: 'City',
      /** UNTRANSLATED */
      region: 'State',
      /** UNTRANSLATED */
      postalCode: 'Zip code',
      /** UNTRANSLATED */
      country: 'Country',
    },
    /** UNTRANSLATED */
    address_description:
      'The user\'s full address in displayable form including all address parts (e.g., "123 Main St, Anytown, USA 12345").',
    /** UNTRANSLATED */
    fullname: 'Fullname',
    /** UNTRANSLATED */
    fullname_description:
      'Flexibly combines familyName, givenName, and middleName based on configuration.',
  },
};

export default Object.freeze(profile);
