const domain = {
  status: {
    connecting: 'Bağlanıyor',
    in_used: 'Kullanımda',
    failed_to_connect: 'Bağlantı başarısız oldu',
  },
  update_endpoint_notice:
    'Özel alan adınız başarıyla ayarlandı. Eğer önceden yapılandırdıysanız, uygulamanız için kullanılan yansıtıcı geri çağrı URI ve Logto uç noktası alan adını güncellemeyi unutmayın.  <a>{{link}}</a>',
  error_hint:
    'DNS kayıtlarınızı güncellediğinizden emin olunuz. {{value}} saniyede bir kontrol edeceğiz.',
  custom: {
    custom_domain: 'Özel Alan Adı',
    custom_domain_description:
      'Kullanıcılarınız için oturum açma deneyimini kişiselleştirmek ve markanızla tutarlılık sağlamak için varsayılan alan adınızı kendi alan adınızla değiştirin.',
    custom_domain_field: 'Özel alan adı',
    custom_domain_placeholder: 'alan_adınız.com',
    add_domain: 'Alan Adı Ekle',
    invalid_domain_format:
      'Geçersiz alt alan adı biçimi. Lütfen en az üç parçadan oluşan bir alt alan adı girin.',
    verify_domain: 'Alan adınızı doğrulayın',
    enable_ssl: 'SSL etkinleştirilsin mi',
    checking_dns_tip:
      'DNS kayıtlarını yapılandırdıktan sonra, işlem otomatik olarak çalışır ve 24 saate kadar sürebilir. Bu arayüzden ayrılabilirsiniz.',
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
      'Hemen kullanarak başlayabileceğiniz bir varsayılan alan adı sağlıyoruz. Her zaman kullanılabilir, böylece uygulamanıza her zaman oturum açma imkanı vardır.',
    default_domain_field: 'Logto varsayılan alan adı',
  },
};

export default domain;
