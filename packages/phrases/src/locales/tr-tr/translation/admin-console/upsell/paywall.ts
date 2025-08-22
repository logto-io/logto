const paywall = {
  applications:
    '<planName/> limitine ulaşılan {{count, number}} başvuru. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin. Yardım için lütfen <a>bizimle iletişime geçin</a>.',
  applications_other:
    '<planName/> limitine ulaşılan {{count, number}} başvurular. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin. Yardım için lütfen <a>bizimle iletişime geçin</a>.',
  machine_to_machine_feature:
    'Kendi başvurularınızı oluşturun ve tüm özelliklerin keyfini çıkarın Sunucu <a>bizimle iletişime geçin</a>.',
  machine_to_machine:
    '<planName/> limitine ulaşılan {{count, number}} makine-makine başvurusu. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin. Yardım için lütfen <a>bizimle iletişime geçin</a>.',
  machine_to_machine_other:
    '<planName/> limitine ulaşılan {{count, number}} makine-makine başvuruları. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin. Yardım için lütfen <a>bizimle iletişime geçin</a>.',
  resources:
    '{{count, number}} <planName/> API kaynağı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  resources_other:
    '{{count, number}} <planName/> API kaynağı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  scopes_per_resource:
    '{{count, number}} <planName/> API kaynağı başına izin sınırına ulaşıldı. Genişletmek için şimdi yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  scopes_per_resource_other:
    '{{count, number}} <planName/> API kaynağı başına izin sınırına ulaşıldı. Genişletmek için şimdi yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  custom_domain:
    'Özel alan işlevselliğini kilidini açmak için <strong>Hobiyi</strong> veya <strong>Pro’yu</strong> yükseltin. Yardım için <a>bizimle iletişime geçin</a> ihtiyacınız varsa.',
  social_connectors:
    '{{count, number}} <planName/> sosyal bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  social_connectors_other:
    '{{count, number}} <planName/> sosyal bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  standard_connectors_feature:
    '<strong>Hobi</strong> veya <strong>Pro</strong> planına yükselerek OIDC, OAuth 2.0 ve SAML protokollerini kullanarak kendi bağlayıcılarınızı oluşturun, sınırsız sosyal bağlayıcılara ve tüm özelliklere sahip olun. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  standard_connectors:
    '{{count, number}} <planName/> sosyal bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  standard_connectors_other:
    '{{count, number}} <planName/> sosyal bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  standard_connectors_pro:
    '{{count, number}} <planName/> standart bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için Kurumsal plana yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  standard_connectors_pro_other:
    '{{count, number}} <planName/> standart bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için Kurumsal plana yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  roles:
    'Ek roller ve izinler eklemek için planı yükseltin. Yardımcı olabileceğimiz bir şey varsa, <a>bizimle iletişime geçmekten</a> çekinmeyin.',
  scopes_per_role:
    '{{count, number}} <planName/> rol başına izin sınırına ulaşıldı. İlave roller ve izinler eklemek için planı yükseltin. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  scopes_per_role_other:
    '{{count, number}} <planName/> rol başına izin sınırına ulaşıldı. İlave roller ve izinler eklemek için planı yükseltin. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  saml_applications_oss:
    'Ek SAML uygulaması, Logto Enterprise planı ile mevcuttur. Yardıma ihtiyacınız olursa, bizimle iletişime geçin.',
  logto_pricing_button_text: 'Logto Bulut Fiyatlandırması',
  saml_applications:
    'Ek SAML uygulaması, Logto Enterprise planı ile mevcuttur. Yardım için bize ulaşın.',
  saml_applications_add_on:
    'SAML uygulama özelliğini ücretli bir plana yükselterek etkinleştirin. Herhangi bir konuda yardıma ihtiyacınız olursa, <a>bizimle iletişime geçmekten</a> çekinmeyin.',
  hooks:
    '{{count, number}} <planName/> webhook sınırına ulaşıldı. Daha fazla webhook oluşturmak için planı yükseltin. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  hooks_other:
    '{{count, number}} <planName/> webhook sınırına ulaşıldı. Daha fazla webhook oluşturmak için planı yükseltin. Yardım için ihtiyacınız olursa, <a>iletişime geçin</a>.',
  mfa: "Güvenliği kontrol etmek için MFA'yı bir ücretli plana geçerek kilidini açın. Yardım için bize <a>iletişim kurmaktan</a> çekinmeyin.",
  organizations:
    'Unlock organizations özelliğini açmak için ücretli bir plana yükseltin. Yardım için <a>iletişime geçin</a> ihtiyacınız olursa.',
  third_party_apps:
    "Üçüncü taraf uygulamalar için Logto'yu IdP olarak kilidini açmak için ücretli bir plana yükseltin. Yardım için <a>iletişime geçin</a> ihtiyacınız olursa.",
  sso_connectors:
    "İşletme SSO'yu kilidini açmak için ücretli bir plana yükseltin. Yardım için <a>iletişime geçin</a> ihtiyacınız olursa.",
  tenant_members:
    'İşbirliği özelliğini kilidini açmak için ücretli bir plana yükseltin. Yardım için <a>iletişime geçin</a> ihtiyacınız olursa.',
  tenant_members_dev_plan:
    'Sınırınıza ulaştınız {{limit}}-üye limit. Yeni birini eklemek için bir üyeyi serbest bırakın veya reddedilen bir daveti geri çekin. Daha fazla kontenjana mı ihtiyacınız var? İletişim kurmaktan çekinmeyin.',
  custom_jwt: {
    title: 'Özel iddialar ekle',
    description:
      'Özel JWT işlevselliği ve prim avantajları için ücretli bir plana yükseltin. Sorularınız varsa, çekinmeden <a>iletişime geçin</a>.',
  },
  bring_your_ui:
    'Özel kullanıcı arayüzü işlevselliği ve prim avantajları için ücretli bir plana geçin.',
  security_features:
    'Gelişmiş güvenlik özelliklerinin kilidini açmak için Pro planına yükseltin. Sorularınız varsa, <a>bizimle iletişime geçmekten</a> çekinmeyin.',
  collect_user_profile:
    'Kayıt sırasında ek kullanıcı profil bilgilerini toplamak için ücretli bir plana yükseltin. Sorularınız varsa, <a>bizimle iletişime geçmekten</a> çekinmeyin.',
};

export default Object.freeze(paywall);
