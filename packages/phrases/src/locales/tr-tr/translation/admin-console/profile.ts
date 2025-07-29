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
    name: 'Ad',
    name_description: 'Kullanıcının görüntülenebilir formdaki tam adı (örneğin, "Ahmet Yılmaz").',
    avatar: 'Avatar',
    avatar_description: "Kullanıcının avatar resminin URL'si.",
    familyName: 'Soyadı',
    familyName_description: 'Kullanıcının soyad(lar)ı (örneğin, "Yılmaz").',
    givenName: 'Ad',
    givenName_description: 'Kullanıcının ad(lar)ı (örneğin, "Ahmet").',
    middleName: 'Orta ad',
    middleName_description: 'Kullanıcının orta ad(lar)ı (örneğin, "Mehmet").',
    nickname: 'Takma ad',
    nickname_description: 'Kullanıcının yasal adından farklı olabilecek günlük veya tanıdık adı.',
    preferredUsername: 'Tercih edilen kullanıcı adı',
    preferredUsername_description: 'Kullanıcının referans alınmak istediği kısa tanımlayıcı.',
    profile: 'Profil',
    profile_description:
      "Kullanıcının insan tarafından okunabilir profil sayfasının URL'si (örneğin, sosyal medya profili).",
    website: 'Web sitesi',
    website_description: "Kullanıcının kişisel web sitesi veya blogunun URL'si.",
    gender: 'Cinsiyet',
    gender_description:
      'Kullanıcının kendini tanımladığı cinsiyet (örneğin, "Kadın", "Erkek", "İkili olmayan")',
    birthdate: 'Doğum tarihi',
    birthdate_description:
      'Kullanıcının belirli bir formattaki doğum tarihi (örneğin, "GG-AA-YYYY").',
    zoneinfo: 'Saat dilimi',
    zoneinfo_description:
      'Kullanıcının IANA formatındaki saat dilimi (örneğin, "Europe/Istanbul").',
    locale: 'Dil',
    locale_description: 'Kullanıcının IETF BCP 47 formatındaki dili (örneğin, "tr-TR").',
    address: {
      formatted: 'Adres',
      streetAddress: 'Sokak adresi',
      locality: 'Şehir',
      region: 'Eyalet',
      postalCode: 'Posta kodu',
      country: 'Ülke',
    },
    address_description:
      'Kullanıcının tüm adres parçalarını içeren görüntülenebilir formdaki tam adresi (örneğin, "123 Ana Cadde, İstanbul, Türkiye 34000").',
    fullname: 'Tam ad',
    fullname_description:
      'Yapılandırmaya bağlı olarak soyadı, ad ve orta adı esnek bir şekilde birleştirir.',
  },
};

export default Object.freeze(profile);
