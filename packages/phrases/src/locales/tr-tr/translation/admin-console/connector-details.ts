const connector_details = {
  page_title: 'Bağdaştırıcı ayrıntıları',
  back_to_connectors: 'Bağdaştırıcılara geri dön',
  check_readme: 'READMEye bak',
  settings: 'Genel ayarlar',
  settings_description:
    "Bağdaştırıcılar Logto'da kritik bir rol oynar. Onların yardımıyla, Logto son kullanıcıların şifresiz kayıt veya giriş yapmasını ve sosyal hesaplarla giriş yapabilme özelliklerini sağlar.",
  parameter_configuration: 'Parametre yapılandırması',
  test_connection: 'Bağlantıyı test et',
  save_error_empty_config: 'Lütfen yapılandırmayı girin',
  send: 'Gönder',
  send_error_invalid_format: 'Geçersiz giriş',
  edit_config_label: 'Json girin',
  test_email_sender: 'Eposta bağdaştırıcınızı test edin',
  test_sms_sender: 'SMS bağdaştırıcınızı test edin',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+90 555 123 45 67',
  test_message_sent: 'Test mesajı gönderildi',
  test_sender_description:
    'Logto testler için "Generic" şablonunu kullanır. Bağlantınız doğru şekilde yapılandırılmışsa bir mesaj alacaksınız.',
  options_change_email: 'Eposta bağdaştırıcınızı değiştirin',
  options_change_sms: 'SMS bağdaştırıcınızı değiştirin',
  connector_deleted: 'Bağdaştırıcı başarıyla silindi',
  type_email: 'Eposta bağdaştırıcısı',
  type_sms: 'SMS bağdaştırıcısı',
  type_social: 'Sosyal bağdaştırıcı',
  in_used_social_deletion_description:
    'Bu bağdaştırıcı, giriş deneyiminizde kullanımda. Silerek, <name/> giriş deneyiminiz, giriş deneyimi ayarlarında silinecektir. Geri eklemeye karar verirseniz yeniden yapılandırmanız gerekecektir.',
  in_used_passwordless_deletion_description:
    'Bu {{name}} giriş deneyiminizde kullanımda. Silerek, giriş deneyiminiz çözülünceye kadar doğru çalışmayacaktır. Geri eklemeye karar verirseniz yeniden yapılandırmanız gerekecektir.',
  deletion_description:
    'Bu bağdaştırıcıyı kaldırıyorsunuz. Geri alınamaz ve geri eklemeye karar verirseniz yeniden yapılandırmanız gerekecektir.',
  logto_email: {
    total_email_sent: 'Toplam e-posta gönderildi: {{value, number}}',
    total_email_sent_tip:
      'Logto dahili e-posta için güvenli ve stabil SendGrid kullanır. Tamamen ücretsizdir. <a>Daha fazla bilgi edinin</a>',
    email_template_title: 'E-posta Şablonu',
    template_description:
      'Yerleşik e-posta, doğrulama e-postalarının sorunsuz teslimi için varsayılan şablonları kullanır. Herhangi bir yapılandırma gerektirmez ve temel marka bilgilerini özelleştirebilirsiniz.',
    template_description_link_text: 'Şablonları görüntüle',
    description_action_text: 'Şablonları görüntüle',
    from_email_field: 'Kimden e-posta',
    sender_name_field: 'Gönderen adı',
    sender_name_tip:
      'E-postalar için gönderen adını özelleştirin. Boş bırakılırsa, varsayılan ad olarak "Verification" kullanılacaktır.',
    sender_name_placeholder: 'Gönderen adınızı girin',
    company_information_field: 'Şirket bilgileri',
    company_information_description:
      'E-postaların alt kısmında şirket adınızı, adresinizi veya posta kodunuzu görüntüleyin.',
    company_information_placeholder: 'Şirketinizin temel bilgileri',
    email_logo_field: 'Eposta logosu',
    email_logo_tip:
      'Marka logonuzu e-postaların en üstüne yerleştirin. Hem açık mod hem de koyu mod için aynı resmi kullanın.',
    urls_not_allowed: 'URLler izin verilmez',
    test_notes: 'Logto testler için "Generic" şablonunu kullanır.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description:
      'Google One Tap , kullanıcıların web sitenize güvenli ve kolay bir şekilde giriş yapmalarını sağlar.',
    enable_google_one_tap: "Google One Tap'i Etkinleştir",
    enable_google_one_tap_description:
      "Giriş deneyiminizde Google One Tap'i etkinleştirin: Kullanıcıların cihazlarında zaten oturum açmışlarsa Google hesaplarıyla hızlıca kayıt olmalarını veya giriş yapmalarını sağlayın.",
    configure_google_one_tap: "Google One Tap'i Yapılandır",
    auto_select: 'Mümkünse kimlik bilgilerini otomatik seç',
    close_on_tap_outside: 'Kullanıcı dışarıya tıklarsa istemi iptal et',
    itp_support: "<a>ITP tarayıcılarda Yükseltilmiş One Tap UX'i</a> etkinleştir",
  },
};

export default Object.freeze(connector_details);
