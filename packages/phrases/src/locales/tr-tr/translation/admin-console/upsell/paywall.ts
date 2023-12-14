const paywall = {
  applications:
    '<planName/> limitine ulaşılan {{count, number}} başvuru. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin. Yardım için lütfen <a>bizimle iletişime geçin</a>.',
  applications_other:
    '<planName/> limitine ulaşılan {{count, number}} başvurular. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin. Yardım için lütfen <a>bizimle iletişime geçin</a>.',
  deprecated_machine_to_machine_feature:
    'Upgrade to the <strong>Hobby</strong> plan to unlock 1 machine-to-machine application, or choose the <strong>Pro</strong> plan for unlimited usage. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  machine_to_machine_feature:
    'Switch to the <strong>Pro</strong> plan to gain extra machine-to-machine applications and enjoy all premium features. <a>Contact us</a> if you have questions.',
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
    'Unlock custom domain functionality by upgrading to <strong>Hobby</strong> or <strong>Pro</strong> plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
  social_connectors:
    '{{count, number}} <planName/> sosyal bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  social_connectors_other:
    '{{count, number}} <planName/> sosyal bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  standard_connectors_feature:
    'Upgrade to the <strong>Hobby</strong> or <strong>Pro</strong> plan to create your own connectors using OIDC, OAuth 2.0, and SAML protocols, plus unlimited social connectors and all the premium features. Feel free to <a>contact us</a> if you need any assistance.',
  standard_connectors:
    '{{count, number}} <planName/> sosyal bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  standard_connectors_other:
    '{{count, number}} <planName/> sosyal bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için planı yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  standard_connectors_pro:
    '{{count, number}} <planName/> standart bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için Kurumsal plana yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  standard_connectors_pro_other:
    '{{count, number}} <planName/> standart bağlayıcı sınırına ulaşıldı. Ekibinizin ihtiyaçlarını karşılamak için Kurumsal plana yükseltin ve OIDC, OAuth 2.0 ve SAML protokolleri kullanarak kendi bağlayıcılarınızı oluşturma yeteneğine sahip olun. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  roles:
    '{{count, number}} <planName/> rol sınırına ulaşıldı. İlave roller ve izinler eklemek için planı yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  roles_other:
    '{{count, number}} <planName/> rol sınırına ulaşıldı. İlave roller ve izinler eklemek için planı yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  scopes_per_role:
    '{{count, number}} <planName/> rol başına izin sınırına ulaşıldı. İlave roller ve izinler eklemek için planı yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  scopes_per_role_other:
    '{{count, number}} <planName/> rol başına izin sınırına ulaşıldı. İlave roller ve izinler eklemek için planı yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  hooks:
    '{{count, number}} <planName/> webhook sınırına ulaşıldı. Daha fazla webhook oluşturmak için planı yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  hooks_other:
    '{{count, number}} <planName/> webhook sınırına ulaşıldı. Daha fazla webhook oluşturmak için planı yükseltin. Yardıma ihtiyacınız olursa, <a>iletişime geçin</a>.',
  mfa: "Güvenliği kontrol etmek için MFA'yı bir ücretli plana geçerek kilidini açın. Yardıma ihtiyacınız olursa bize <a>iletişim kurmaktan</a> çekinmeyin.",
  /** UNTRANSLATED */
  organizations:
    'Unlock organizations by upgrading to a paid plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
};

export default Object.freeze(paywall);
