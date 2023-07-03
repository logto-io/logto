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
      'Logto, güvenli ve stabil yerleşik e-posta için SendGrid kullanır. Tamamen ücretsizdir.',
    email_template_title: 'E-posta Şablonu',
    template_description:
      'Yerleşik e-posta, doğrulama e-postalarının sorunsuz teslimi için varsayılan şablonları kullanır. Herhangi bir yapılandırma gerektirmez ve temel marka bilgilerini özelleştirebilirsiniz.',
    description_action_text: 'Şablonları görüntüle',
    from_email_field: 'Kimden e-posta',
    from_name_field: 'Kimden adı',
    from_name_tip:
      'E-postalar için gönderen adını özelleştirin. Boş bırakılırsa, varsayılan ad olarak "Doğrulama" kullanılacaktır.',
    from_name_placeholder: 'Gönderen adınızı girin',
    company_address_field: 'Şirket adresi',
    company_address_tip:
      'E-postaların altında şirket adresi ve posta kodunu görüntülemek, otantikliği artırır, iletişim bilgileri sağlar ve uyumluluğu sağlar.',
    company_address_placeholder: 'Şirket adresinizi girin',
    app_logo_field: 'Uygulama Logosu',
    app_logo_tip:
      'E-postaların üstünde marka logosunu görüntüleyin. Aynı görüntüyü açık mod ve karanlık mod için kullanın.',
    urls_not_allowed: 'URLs are not allowed',
    test_notes: 'Logto testler için "Generic" şablonunu kullanır.',
  },
};

export default connector_details;
