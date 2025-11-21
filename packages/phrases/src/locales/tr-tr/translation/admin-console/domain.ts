const domain = {
  status: {
    connecting: 'Bağlanıyor...',
    in_use: 'Kullanımda',
    failed_to_connect: 'Bağlantı başarısız oldu',
  },
  update_endpoint_notice:
    'Özellikleri için özel bir alan adı kullanmak istiyorsanız, uygulamanızda Sosyal bağlayıcı geri çağrı URI ve Logto uç noktası için alan adını güncellemeyi unutmayın.',
  error_hint:
    'DNS kayıtlarınızı güncellediğinizden emin olunuz. {{value}} saniyede bir kontrol edeceğiz.',
  custom: {
    custom_domain: 'Özel Alan Adları',
    custom_domain_description:
      'Markalaşmanızı geliştirin ve özel bir alan adı kullanın. Bu alan adı oturum açma deneyiminizde kullanılacaktır.',
    custom_domain_field: 'Özel alan adları',
    custom_domain_placeholder: 'auth.domain.com',
    add_custom_domain_field: 'Özel bir alan adı ekle',
    custom_domains_field: 'Özel alan adları',
    add_domain: 'Alan Adı Ekle',
    invalid_domain_format:
      'Lütfen geçerli bir alan adı URL\'si sağlayın, en az üç parçaya sahip olmalıdır, örneğin "auth.domain.com."',
    verify_domain: 'Alan adınızı doğrulayın',
    enable_ssl: 'SSL etkinleştirilsin mi',
    checking_dns_tip:
      'DNS kayıtlarını yapılandırdıktan sonra, işlem otomatik olarak çalışır ve 24 saate kadar sürebilir. Bu arayüzden ayrılabilirsiniz.',
    enable_ssl_tip:
      'SSL etkinleştirilsin mi otomatik olarak çalışır ve 24 saate kadar sürebilir. Bu arayüzden ayrılabilirsiniz.',
    generating_dns_records: 'DNS kayıtları oluşturuluyor...',
    add_dns_records: 'Lütfen bu DNS kayıtlarını DNS sağlayıcınıza ekleyin.',
    dns_table: {
      type_field: 'Tip',
      name_field: 'İsim',
      value_field: 'Değer',
    },
    deletion: {
      delete_domain: 'Alan Adını Sil',
      reminder: 'Özel Alan Adını Sil',
      description: 'Bu özel alan adını silmek istediğinizden emin misiniz?',
      in_used_description:
        'Bu "<span>{{domain}}</span>" adlı özel alan adını silmek istediğinizden emin misiniz?',
      in_used_tip:
        'Bu özel alan adını önce sosyal bağlantı sağlayıcınızda veya uygulama uç noktasında yapılandırdıysanız, URI\'yi önce Logto varsayılan alan adı olan "<span>{{domain}}</span>" olarak değiştirmeniz gerekir. Bu, sosyal giriş düğmesinin düzgün çalışması için gereklidir.',
      deleted: 'Özel alan adı başarıyla silindi!',
    },
    config_custom_domain_description:
      'Aşağıdaki özellikleri ayarlamak için özel alan adları yapılandırın: uygulamalar, sosyal bağlayıcılar ve kurumsal bağlayıcılar.',
  },
  default: {
    default_domain: 'Varsayılan Alan Adı',
    default_domain_description:
      'Logto, ek bir yapılandırma olmadan kullanıma hazır önceden yapılandırılmış bir varsayılan alan adı sunar. Bu varsayılan alan adı, özel bir alan adı etkinleştirdiyseniz bile yedek seçeneği olarak hizmet verir.',
    default_domain_field: 'Logto varsayılan alan adı',
  },
  custom_endpoint_note:
    'Bu uç noktaların alan adını özelleştirebilirsiniz. "{{custom}}" veya "{{default}}" seçeneklerinden birini seçin.',
  custom_social_callback_url_note:
    'Bu URI\'nin alan adını uygulamanızın uç noktasıyla eşleştirmek için özelleştirebilirsiniz. "{{custom}}" veya "{{default}}" seçeneklerinden birini seçin.',
  custom_acs_url_note:
    'Bu URI\'nin alan adını kimlik sağlayıcısı Assertion Consumer Service URL\'inizle eşleştirmek üzere özelleştirebilirsiniz. "{{custom}}" veya "{{default}}" seçeneklerinden birini seçin.',
  switch_custom_domain_tip:
    'İlgili uç noktayı görmek için alan adınızı değiştirin. <a>özel alan adları</a> üzerinden daha fazla alan ekleyin.',
  switch_saml_app_domain_tip:
    'İlgili URL’leri görmek için alan adını değiştirin. SAML protokollerinde metadata URL’leri erişilebilir herhangi bir alan adında barındırılabilir. Ancak seçilen alan adı, SP’lerin kullanıcıları kimlik doğrulamasına yönlendirmek için kullandığı SSO servis URL’sini belirler; bu da oturum açma deneyimini ve URL görünürlüğünü etkiler.',
  switch_saml_connector_domain_tip:
    'İlgili URL’leri görmek için alan adını değiştirin. Seçilen alan adı ACS URL’nizi belirler ve SSO oturum açmasından sonra kullanıcıların nereye yönlendirileceğini etkiler. Uygulamanızın beklenen yönlendirme davranışına uyan alan adını seçin.',
};

export default Object.freeze(domain);
