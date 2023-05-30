const domain = {
  status: {
    connecting: 'Bağlanıyor',
    in_used: 'Kullanımda',
    failed_to_connect: 'Bağlantı başarısız oldu',
  },
  update_endpoint_alert: {
    description:
      'Özel alan adınız başarıyla yapılandırıldı. Aşağıdaki kaynakları yapılandırmışsanız, {{domain}} kullanmış olduğunuz alan adını da güncellemeniz gerekiyor.',
    endpoint_url: '<a>{{link}}</a> endpoint URL',
    application_settings_link_text: 'Uygulama Ayarları',
    callback_url: "<a>{{link}}</a> geri çağrı URL'si",
    social_connector_link_text: 'Sosyal Bağlayıcı',
    api_identifier: '<a>{{link}}</a> API tanımlayıcısı',
    uri_management_api_link_text: "URI Yönetimi API'si",
    tip: 'Ayarları değiştirdikten sonra, deneyimimizde Test edebilirsiniz <a>{{link}}</a>.',
  },
  custom: {
    custom_domain: 'Özel Alan Adı',
    custom_domain_description:
      'Varsayılan alan adını kendi alan adınızla değiştirerek markanızla tutarlılık sağlayın ve kullanıcılarınız için oturum açma deneyimini kişiselleştirin.',
    custom_domain_field: 'Özel alan adı',
    custom_domain_placeholder: 'yourdomain.com',
    add_domain: 'Alan Adı Ekle',
    invalid_domain_format: 'Geçersiz alan adı biçimi',
    steps: {
      add_records: {
        title: 'DNS sağlayıcınıza aşağıdaki DNS kayıtlarını ekleyin',
        generating_dns_records: 'DNS kayıtları oluşturuluyor...',
        table: {
          type_field: 'Tip',
          name_field: 'Adı',
          value_field: 'Değer',
        },
        finish_and_continue: 'Tamamla ve Devam Et',
      },
      verify_domain: {
        title: 'DNS kayıtlarının bağlantısını otomatik olarak doğrulayın',
        description:
          'İşlem otomatik olarak gerçekleştirilecek ve birkaç dakika (24 saat kadar) sürebilir. Çalışırken bu arabirimden çıkabilirsiniz.',
        error_message:
          'Doğrulama başarısız oldu. Lütfen alan adınızı veya DNS kayıtlarınızı kontrol edin.',
      },
      generate_ssl_cert: {
        title: 'Otomatik olarak bir SSL sertifikası oluşturun',
        description:
          'İşlem otomatik olarak gerçekleştirilecek ve birkaç dakika (24 saat kadar) sürebilir. Çalışırken bu arabirimden çıkabilirsiniz.',
        error_message: 'SSL Sertifikası oluşturma başarısız oldu. ',
      },
      enable_domain: 'Özel Alan Adınızı Otomatik Olarak Etkinleştirin',
    },
    deletion: {
      delete_domain: 'Alan Adını Sil',
      reminder: 'Özel Alan Adını Sil',
      description: 'Bu özel alan adını silmek istediğinizden emin misiniz?',
      in_used_description: 'Bu özel alan adını "{{domain}}" silmek istediğinizden emin misiniz?',
      in_used_tip:
        'Bu özel alan adını sosyal bağlayıcı sağlayıcınızda veya uygulama ucu noktasında yapılandırdıysanız, sosyal oturum açma düğmesinin düzgün çalışması için URI\'yi Logto özel alan adı "{{domain}}" olarak değiştirmeniz gerekecektir. Bunun yapılması gerekir.',
      deleted: 'Özel alan adı başarıyla silindi!',
    },
  },
  default: {
    default_domain: 'Varsayılan Alan Adı',
    default_domain_description:
      'Doğrudan çevrimiçi olarak kullanılabilecek bir varsayılan alan adı sağlıyoruz. Özelleştirilmiş bir alan adına geçerseniz bile her zaman kullanılabilir, bu da uygulamanıza her zaman oturum açma imkanı verir.',
    default_domain_field: 'Logto varsayılan alan adı',
  },
};

export default domain;
