const domain = {
  status: {
    connecting: 'Bağlanıyor...',
    in_use: 'Kullanımda',
    failed_to_connect: 'Bağlantı başarısız oldu',
  },
  update_endpoint_notice:
    'Özellikleri için özel bir alan adı kullanmak istiyorsanız, uygulamanızda Sosyal bağlayıcı geri çağrı URI ve Logto uç noktası için alan adını güncellemeyi unutmayın. <a>{{link}}</a>',
  error_hint:
    'DNS kayıtlarınızı güncellediğinizden emin olunuz. {{value}} saniyede bir kontrol edeceğiz.',
  custom: {
    custom_domain: 'Özel Alan Adı',
    custom_domain_description:
      'Markalaşmanızı geliştirin ve özel bir alan adı kullanın. Bu alan adı oturum açma deneyiminizde kullanılacaktır.',
    custom_domain_field: 'Özel alan adı',
    custom_domain_placeholder: 'alan_adınız.com',
    add_domain: 'Alan Adı Ekle',
    invalid_domain_format:
      'Lütfen geçerli bir alan adı URL\'si sağlayın, en az üç parçaya sahip olmalıdır, örneğin "alanınız.com."',
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
};

export default Object.freeze(domain);
