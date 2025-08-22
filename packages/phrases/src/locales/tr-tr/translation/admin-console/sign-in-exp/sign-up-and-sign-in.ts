const sign_up_and_sign_in = {
  identifiers_email: 'E-posta adresi',
  identifiers_phone: 'Telefon numarası',
  identifiers_username: 'Kullanıcı adı',
  identifiers_email_or_sms: 'E-posta adresi veya telefon numarası',
  identifiers_none: 'Geçersiz',
  and: 've',
  or: 'veya',
  sign_up: {
    title: 'KAYDOL',
    sign_up_identifier: 'Kayıt tanımlayıcı',
    identifier_description:
      'Yeni bir hesap oluştururken seçilen tüm kayıt tanımlayıcılar gereklidir.',
    sign_up_authentication: 'Kaydolma doğrulama ayarları',
    verification_tip:
      'Kullanıcılar, kaydolma sırasında bir doğrulama kodu girerek yapılandırdığınız e-posta veya telefon numarasını doğrulamalıdır.',
    authentication_description:
      'Seçilen tüm işlemler, kullanıcıların akışı tamamlamaları zorunlu olacaktır.',
    set_a_password_option: 'Şifrenizi oluşturun',
    verify_at_sign_up_option: 'Kaydolduğunuzda doğrulayın',
    social_only_creation_description: '(Bu sadece sosyal hesap yaratımı için geçerlidir)',
  },
  sign_in: {
    title: 'OTURUM AÇIN',
    sign_in_identifier_and_auth: 'Oturum açma tanımlayıcısı ve doğrulama ayarları',
    description: 'Kullanıcılar mevcut seçeneklerden herhangi biriyle oturum açabilir.',
    add_sign_in_method: 'Oturum açma yöntemi ekle',
    add_sign_up_method: 'Kayıt yöntemi ekle',
    password_auth: 'Şifre',
    verification_code_auth: 'Doğrulama kodu',
    auth_swap_tip:
      'Akışta ilk olarak hangisinin göründüğünü belirlemek için seçeneklerin yerlerini değiştirin.',
    require_auth_factor: 'En az bir doğrulama faktörü seçmeniz gerekiyor.',
    forgot_password_verification_method: 'Şifre sıfırlama doğrulama yöntemi',
    forgot_password_description:
      'Kullanıcılar, mevcut olan herhangi bir doğrulama yöntemi kullanarak şifrelerini sıfırlayabilir.',
    add_verification_method: 'Doğrulama yöntemi ekle',
    email_verification_code: 'E-posta doğrulama kodu',
    phone_verification_code: 'Telefon doğrulama kodu',
  },
  social_sign_in: {
    title: 'SOSYAL MEDYA İLE OTURUM AÇIN',
    social_sign_in: 'Sosyal medya ile oturum açın',
    description:
      'Kullanıcı, sosyal bağlantı noktası aracılığıyla kaydolurken belirlediğiniz zorunlu tanımlayıcıya bağlı olarak bir tanımlayıcı sağlaması istenebilir.',
    add_social_connector: 'Sosyal Bağlantı Noktası Ekle',
    set_up_hint: {
      not_in_list: 'Listede değil mi?',
      set_up_more: 'Daha fazlasını kur',
      go_to: 'şimdi farklı sosyal bağlantı noktalarına.',
    },
    automatic_account_linking: 'Otomatik hesap bağlantısı',
    automatic_account_linking_label:
      'Açıkken, bir kullanıcı sisteme yeni bir sosyal kimlikle giriş yaparsa ve aynı tanımlayıcıya (örn., e-posta) sahip yalnızca bir mevcut hesap varsa, Logto kullanıcıdan hesap bağlantısı istemek yerine hesabı otomatik olarak sosyal kimlikle bağlar.',
  },
  tip: {
    set_a_password: 'Kullanıcı adınıza benzersiz bir şifre belirlemek şarttır.',
    verify_at_sign_up:
      'Şu anda yalnızca doğrulanmış e-postayı destekliyoruz. Doğrulama yapılmazsa kullanıcı kitleniz düşük kaliteli e-posta adreslerini içerebilir.',
    password_auth:
      'Bu, kaydolma işlemi sırasında bir şifre belirleme seçeneğini etkinleştirdiğiniz için önemlidir.',
    verification_code_auth:
      'Bu, yalnızca doğrulama kodu sağlama seçeneğini etkinleştirdiğiniz için önemlidir. Kayıt işlemi sırasında şifre oluşturma izni verildiğinde kutuyu kaldırabilirsiniz.',
    email_mfa_enabled:
      'E-posta doğrulama kodu zaten MFA için etkin, bu yüzden güvenlik için birincil oturum açma yöntemi olarak tekrar kullanılamaz.',
    phone_mfa_enabled:
      'Telefon doğrulama kodu zaten MFA için etkin, bu yüzden güvenlik için birincil oturum açma yöntemi olarak tekrar kullanılamaz.',
    delete_sign_in_method: 'Bu, {{identifier}} gerekliliğini belirlediğiniz için önemlidir.',
    password_disabled_notification:
      'Kullanıcı adı ile kaydolma için "Şifrenizi oluşturun" seçeneği devre dışı bırakıldı, bu da kullanıcıların oturum açmasını engelleyebilir. Kaydetmeye devam etmek için onaylayın.',
  },
  advanced_options: {
    title: 'GELİŞMİŞ SEÇENEKLER',
    enable_single_sign_on: 'Kurumsal Tek Oturum Açmayı Etkinleştir (SSO)',
    enable_single_sign_on_description:
      'Kullanıcıların kurumsal kimlikleriyle Tek Oturum Açmayı etkinleştirin.',
    single_sign_on_hint: {
      prefix: 'Şuraya git: ',
      link: '"Kurumsal Tek Oturum Açma"',
      suffix: 'bölümüne daha fazla kurumsal bağlantı noktası kurmak için.',
    },
    enable_user_registration: 'Kullanıcı Kaydını Etkinleştir',
    enable_user_registration_description:
      'Kullanıcı kaydını etkinleştir veya devre dışı bırak. Devre dışı bırakıldığında, kullanıcılar yönetici konsolunda hala eklenilebilir, ancak kullanıcılar artık oturum açma arayüzü üzerinden hesap oluşturamaz.',
    unknown_session_redirect_url: "Bilinmeyen oturum yönlendirme URL'si",
    unknown_session_redirect_url_tip:
      "Bazen oturumun süresi dolduğunda veya kullanıcı oturum açma bağlantısını yer imlerine eklediğinde ya da paylaştığında Logto, kullanıcının oturumunu oturum açma sayfasında tanımayabilir. Varsayılan olarak, “bilinmeyen oturum” 404 hatası görünür. Kullanıcı deneyimini geliştirmek için, kullanıcıları uygulamanıza geri yönlendirmek ve kimlik doğrulamasını yeniden başlatmak için bir geri dönüş URL'si ayarlayın.",
  },
};

export default Object.freeze(sign_up_and_sign_in);
