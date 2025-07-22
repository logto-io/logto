const user_details = {
  page_title: 'Kullanıcı detayları',
  back_to_users: 'Kullanıcı Yönetimine Geri Dön',
  created_title: 'Bu kullanıcı başarıyla oluşturuldu',
  created_guide: 'Kullanıcının oturum açma sürecinde yardımcı olacak bilgiler burada.',
  created_email: 'E-posta adresi:',
  created_phone: 'Telefon numarası:',
  created_username: 'Kullanıcı Adı:',
  created_password: 'Şifre:',
  menu_delete: 'Sil',
  delete_description: 'Bu işlem geri alınamaz. Kullanıcıyı kalıcı olarak siler.',
  deleted: 'Kullanıcı başarıyla silindi.',
  reset_password: {
    reset_title: 'Şifreyi sıfırlamak istediğinizden emin misiniz?',
    generate_title: 'Şifre oluşturmak istediğinizden emin misiniz?',
    content: 'Bu işlem geri alınamaz. Bu, kullanıcının oturum açma bilgilerini sıfırlayacaktır.',
    reset_complete: 'Bu kullanıcı sıfırlandı',
    generate_complete: 'Şifre oluşturuldu',
    new_password: 'Yeni şifre:',
    password: 'Şifre:',
  },
  tab_settings: 'Ayarlar',
  tab_roles: 'Kullanıcı rolleri',
  tab_logs: 'Kullanıcı kayıtları',
  tab_organizations: 'Organizasyonlar',
  authentication: 'Kimlik doğrulama',
  authentication_description:
    'Her kullanıcının, temel veriler, sosyal kimlikler ve özel verilerden oluşan tüm kullanıcı bilgilerini içeren bir profil vardır.',
  user_profile: 'Kullanıcı profili',
  field_email: 'Eposta adresi',
  field_phone: 'Telefon numarası',
  field_username: 'Kullanıcı Adı',
  field_password: 'Şifre',
  field_name: 'İsim',
  field_avatar: 'Avatar resmi URLi',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Özel veriler',
  field_custom_data_tip:
    'Kullanıcı tarafından tercih edilen renk ve dil gibi önceden tanımlanmış kullanıcı özelliklerinde listelenmeyen ek kullanıcı bilgileri.',
  field_profile: 'Profil',
  field_profile_tip:
    'Kullanıcının özelliklerine dahil olmayan ek OpenID Connect standart talepleri. Tüm bilinmeyen özelliklerin kaldırılacağını unutmayın. Daha fazla bilgi için <a>profil özellik referansına</a> bakın.',
  field_connectors: 'Sosyal bağlayıcılar',
  field_sso_connectors: 'İş bağlantıları',
  custom_data_invalid: 'Özel veriler geçerli bir JSON nesnesi olmalıdır',
  profile_invalid: 'Profil geçerli bir JSON nesnesi olmalıdır',
  password_already_set: 'Şifre zaten ayarlandı',
  no_password_set: 'Şifre ayarlanmadı',
  connectors: {
    connectors: 'Bağlayıcılar',
    user_id: 'Kullanıcı IDsi',
    remove: 'Kaldır',
    connected: 'Bu kullanıcı birden fazla sosyal bağlayıcıya bağlıdır.',
    not_connected: 'Kullanıcı herhangi bir sosyal bağlayıcıya bağlı değil',
    deletion_confirmation:
      'Mevcut <name/> kimliğini kaldırıyorsunuz. Devam etmek istediğinizden emin misiniz?',
  },
  sso_connectors: {
    connectors: 'Bağlayıcılar',
    enterprise_id: 'Şirket ID',
    connected:
      'Bu kullanıcı, Tek Oturum Kimliği için birden çok kurumsal kimlik sağlayıcıya bağlıdır.',
    not_connected:
      'Kullanıcı, Tek Oturum Kimliği için herhangi bir kurumsal kimlik sağlayıcıya bağlı değil.',
  },
  mfa: {
    field_name: 'Çok faktörlü kimlik doğrulama',
    field_description: 'Bu kullanıcı 2 adımlı kimlik doğrulama faktörlerini etkinleştirdi.',
    name_column: 'Çok Faktörlü Kimlik Doğrulama',
    field_description_empty:
      'Bu kullanıcı 2 aşamalı kimlik doğrulama faktörlerini etkinleştirmedi.',
    deletion_confirmation:
      'Varolan 2 aşamalı doğrulama için <name/> kaldırıyorsunuz. Devam etmek istediğinizden emin misiniz?',
  },
  suspended: 'Askıya alınmış',
  suspend_user: 'Kullanıcıyı Askıya Al',
  suspend_user_reminder:
    'Bu kullanıcıyı askıya almak istediğinizden emin misiniz? Kullanıcı uygulamanıza giriş yapamayacak ve mevcut erişim belirteci süresi dolduktan sonra yeni bir erişim belirteci alamayacak. Ayrıca bu kullanıcı tarafından yapılan herhangi bir API isteği başarısız olacaktır.',
  suspend_action: 'Askıya Al',
  user_suspended: 'Kullanıcı askıya alındı.',
  reactivate_user: 'Kullanıcıyı Yeniden Etkinleştir',
  reactivate_user_reminder:
    'Bu kullanıcının yeniden etkinleştirmek istediğinizden emin misiniz? Böyle yapmak, bu kullanıcı için giriş girişimlerine izin verecektir.',
  reactivate_action: 'Yeniden Etkinleştir',
  user_reactivated: 'Kullanıcı yeniden etkinleştirildi.',
  roles: {
    name_column: 'Kullanıcı rolü',
    description_column: 'Açıklama',
    assign_button: 'Rolleri ata',
    delete_description:
      'Bu işlem, bu rolü bu kullanıcıdan kaldıracaktır. Rol kendisi hala var olacaktır, ancak artık bu kullanıcıyla ilişkili olmayacaktır.',
    deleted: '{{name}} bu kullanıcıdan başarıyla kaldırıldı.',
    assign_title: "{{name}}'e rolleri ata",
    assign_subtitle:
      'İsim, açıklama veya rol kimliği ile arama yaparak uygun kullanıcı rollerini bulun.',
    assign_role_field: 'Rolleri ata',
    role_search_placeholder: 'Rol adına göre arama yapın',
    added_text: '{{value, number}} eklendi',
    assigned_user_count: '{{value, number}} kullanıcı',
    confirm_assign: 'Rolleri ata',
    role_assigned: 'Rol(ler) başarıyla atandı',
    search: 'Rol adına, açıklamasına veya Kimliğine göre arama yapın',
    empty: 'Uygun rol yok',
  },
  warning_no_sign_in_identifier:
    'Kullanıcının giriş yapmak için en az bir oturum açma kimliği (kullanıcı adı, e-posta, telefon numarası, veya sosyal) olması gerekiyor. Devam etmek istediğinizden emin misiniz?',
  personal_access_tokens: {
    title: 'Kişisel erişim belirteci',
    title_other: 'Kişisel erişim belirteçleri',
    title_short: 'belirteç',
    empty: 'Kullanıcının herhangi bir kişisel erişim belirteci yok.',
    create: 'Yeni belirteç oluştur',
    tip: 'Kişisel erişim belirteçleri (PATs), kullanıcıların kimlik bilgilerini veya interaktif oturum açmayı kullanmadan erişim belirteçleri vermesini sağlamak için güvenli bir yol sunar. Bu, kaynaklara programatik erişim gerektiren CI/CD, betikler veya uygulamalar için kullanışlıdır.',
    value: 'Değer',
    created_at: 'Oluşturulma tarihi',
    expires_at: 'Son kullanma tarihi',
    never: 'Hiçbir zaman',
    create_new_token: 'Yeni belirteç oluştur',
    delete_confirmation: 'Bu işlem geri alınamaz. Bu belirteci silmek istediğinizden emin misiniz?',
    expired: 'Süresi dolmuş',
    expired_tooltip: 'Bu belirtecin süresi {{date}} tarihinde dolmuştur.',
    create_modal: {
      title: 'Kişisel erişim belirteci oluştur',
      expiration: 'Son kullanma tarihi',
      expiration_description: 'Belirtecin süresi {{date}} tarihinde dolacak.',
      expiration_description_never:
        'Belirtecin süresi dolmayacak. Güvenliği artırmak için bir son kullanma tarihi belirlemenizi öneririz.',
      days: '{{count}} gün',
      days_other: '{{count}} gün',
      created: 'Belirteç {{name}} başarıyla oluşturuldu.',
    },
    edit_modal: {
      title: 'Kişisel erişim belirtecini düzenle',
      edited: 'Belirteç {{name}} başarıyla düzenlendi.',
    },
  },
  connections: {
    /** UNTRANSLATED */
    title: 'Connection',
    /** UNTRANSLATED */
    description:
      'The user links third-party accounts for social sign-in, enterprise SSO, or resources access.',
    /** UNTRANSLATED */
    token_status_column: 'Token status',
    token_status: {
      /** UNTRANSLATED */
      active: 'Active',
      /** UNTRANSLATED */
      expired: 'Expired',
      /** UNTRANSLATED */
      inactive: 'Inactive',
      /** UNTRANSLATED */
      not_applicable: 'Not applicable',
      /** UNTRANSLATED */
      available: 'Available',
      /** UNTRANSLATED */
      not_available: 'Not available',
    },
  },
};

export default Object.freeze(user_details);
