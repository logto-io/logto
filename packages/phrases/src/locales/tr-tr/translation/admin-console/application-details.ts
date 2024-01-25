const application_details = {
  page_title: 'Uygulama detayları',
  back_to_applications: 'Uygulamalara geri dön',
  check_guide: 'Kılavuza Göz At',
  settings: 'Ayarlar',
  settings_description:
    'Uygulamalar, Logto için OIDC, oturum açma deneyimi, denetim kayıtları vb. alanlarda uygulamalarınızı tanımlamak için kullanılır.',
  /** UNTRANSLATED */
  integration: 'Integration',
  /** UNTRANSLATED */
  integration_description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide.",
  /** UNTRANSLATED */
  service_configuration: 'Service configuration',
  /** UNTRANSLATED */
  service_configuration_description: 'Complete the necessary configurations in your service.',
  /** UNTRANSLATED */
  session: 'Session',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: 'Roller',
  machine_logs: 'Makine günlükleri',
  application_name: 'Uygulama Adı',
  application_name_placeholder: 'Uygulamam',
  description: 'Açıklama',
  description_placeholder: 'Uygulama açıklamasını giriniz',
  config_endpoint: 'OpenID Provider yapılandırma bitiş noktası',
  authorization_endpoint: 'Yetkilendirme bitiş noktası',
  authorization_endpoint_tip:
    'Kimlik doğrulama ve yetkilendirme gerçekleştirmek için bitiş noktası. OpenID Connect <a>Authentication</a> için kullanılır.',
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Logto bitiş noktası',
  application_id: 'Uygulama IDsi',
  application_id_tip:
    'Logto tarafından normalde oluşturulan benzersiz uygulama tanımlayıcısıdır. Ayrıca OpenID Connect "client_id" anlamına gelir.',
  application_secret: 'Uygulama Sırrı',
  redirect_uri: 'Yönlendirme URIı',
  redirect_uris: 'Yönlendirme URIları',
  redirect_uri_placeholder: 'https://siteniz.com/uygulama',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI, kullanıcının oturum açma işlemi tamamlandıktan sonra yönlendirir (başarılı olsa da olmasa da). Ayrıntılı bilgi için OpenID Connect <a>AuthRequesta</a> bakınız.',
  post_sign_out_redirect_uri: 'Oturumdan Çıkış sonrası yönlendirme URIı',
  post_sign_out_redirect_uris: 'Oturumdan Çıkış sonrası yönlendirme URIları',
  post_sign_out_redirect_uri_placeholder: 'https://siteniz.com/anasayfa',
  post_sign_out_redirect_uri_tip:
    'URI, Oturumdan Çıkış sonrası yönlendirme yapar (isteğe bağlıdır). Bazı uygulama türlerinde pratik bir etkisi olmayabilir.',
  cors_allowed_origins: 'CORS izinli originler',
  cors_allowed_origins_placeholder: 'https://siteniz.com',
  cors_allowed_origins_tip:
    'Varsayılan olarak, Yönlendirme URIlerinin tüm originlerine izin verilir. Genellikle bu alan için herhangi bir işlem gerekmez. Ayrıntılı bilgi için <a>MDN doc</a> sayfasına bakın.',
  token_endpoint: 'Token bitiş noktası',
  user_info_endpoint: 'Userinfo bitiş noktası',
  enable_admin_access: 'Yönetici erişimini etkinleştir',
  enable_admin_access_label:
    "Yönetim API erişimine izin verme veya engelleme. Etkinleştirildikten sonra, bu uygulama adına yönetim API'sini çağırmak için erişim belirteçleri kullanabilirsiniz.",
  always_issue_refresh_token: 'Her zaman Refresh Token ver',
  always_issue_refresh_token_label:
    "Bu yapılandırmayı etkinleştirmek, Logto'nun OpenID Connect ile uyumlu olmayan ve olası sorunlara neden olabilecek her zaman Refresh Token çıkarmasına izin verir `prompt=consent` kimlik doğrulama isteğinin sunulup sunulmadığına bakılmaksızın. Ancak, bu uygulama yalnızca zorunlu olduğunda caydırılmayan bir uygulamadır.",
  refresh_token_ttl: 'Refresh Token süresi (gün cinsinden)',
  refresh_token_ttl_tip:
    'Yeni erişim belirteği istekleri için Refresh Belirteği kullanılabilecek süre. Belirteğin süresi dolmadan önce yapılan talepler belirteğin ömrünü uzatacaktır.',
  rotate_refresh_token: 'Refresh Tokenı değiştir',
  rotate_refresh_token_label:
    "Bu seçenek etkinleştirildiğinde, Logto Token Bitiş Süresinin %70'i geçildiğinde veya belli koşullar sağlandığında yeni bir Refresh Token verecektir. <a>Daha fazlası için tıklayın</a>",
  delete_description:
    'Bu eylem geri alınamaz. Uygulama kalıcı olarak silinecektir. Lütfen onaylamak için uygulama adı <span>{{name}}</span> girin.',
  enter_your_application_name: 'Uygulama adı giriniz',
  application_deleted: '{{name}} Uygulaması başarıyla silindi',
  redirect_uri_required: 'En az 1 yönlendirme URIı girmelisiniz',
  /** UNTRANSLATED */
  app_domain_protected: 'App domain protected',
  /** UNTRANSLATED */
  app_domain_protected_description_1:
    'Feel free to use your subdomain with protected.app powered by Logto, which is permanently valid.',
  /** UNTRANSLATED */
  app_domain_protected_description_2:
    'Feel free to utilize your domain <domain>{{domain}}</domain> which is permanently valid.',
  /** UNTRANSLATED */
  origin_url_tip:
    "Enter primary website address of your application, excluding any '/routes'.\n\nNote: The Origin URL itself won't require authentication; only accesses via the added app domain will be protected.",
  /** UNTRANSLATED */
  custom_rules: 'Custom authentication rules',
  /** UNTRANSLATED */
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  /** UNTRANSLATED */
  custom_rules_description:
    'Set rules with regular expressions for authentication-required routes. Default: full-site protection if blank.',
  /** UNTRANSLATED */
  authentication_routes: 'Authentication routes',
  /** UNTRANSLATED */
  custom_rules_tip:
    "Here are two case scenarios:<ol><li>To only protect routes '/admin' and '/privacy' with authentication: ^/(admin|privacy)/.*</li><li>To exclude JPG images from authentication: ^(?!.*\\.jpg$).*$</li></ol>",
  /** UNTRANSLATED */
  authentication_routes_description:
    'Redirect your authentication button using the specified routes. Note: These routes are irreplaceable.',
  /** UNTRANSLATED */
  implement_jwt_verification: 'Implement JWT verification',
  /** UNTRANSLATED */
  implement_jwt_verification_description:
    'Configure JWT in your service for essential security communication. Follow the <a>JWT implementation guide</a>.',
  /** UNTRANSLATED */
  session_duration: 'Session duration (days)',
  /** UNTRANSLATED */
  try_it: 'Try it',
  branding: {
    /** UNTRANSLATED */
    name: 'Branding',
    /** UNTRANSLATED */
    description: "Customize your application's display name and logo on the consent screen.",
    /** UNTRANSLATED */
    more_info: 'More info',
    /** UNTRANSLATED */
    more_info_description: 'Offer users more details about your application on the consent screen.',
    /** UNTRANSLATED */
    display_name: 'Display name',
    /** UNTRANSLATED */
    display_logo: 'Display logo',
    /** UNTRANSLATED */
    display_logo_dark: 'Display logo (dark)',
    /** UNTRANSLATED */
    terms_of_use_url: 'Application terms of use URL',
    /** UNTRANSLATED */
    privacy_policy_url: 'Application privacy policy URL',
  },
  permissions: {
    /** UNTRANSLATED */
    name: 'Permissions',
    /** UNTRANSLATED */
    description:
      'Select the permissions that the third-party application requires for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_permissions: 'Personal user data',
    /** UNTRANSLATED */
    organization_permissions: 'Organization access',
    /** UNTRANSLATED */
    table_name: 'Grant permissions',
    /** UNTRANSLATED */
    field_name: 'Permission',
    /** UNTRANSLATED */
    field_description: 'Displayed in the consent screen',
    /** UNTRANSLATED */
    delete_text: 'Remove permission',
    /** UNTRANSLATED */
    permission_delete_confirm:
      'This action will withdraw the permissions granted to the third-party app, preventing it from requesting user authorization for specific data types. Are you sure you want to continue?',
    /** UNTRANSLATED */
    permissions_assignment_description:
      'Select the permissions the third-party application requests for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_profile: 'User data',
    /** UNTRANSLATED */
    api_resource: 'API resource',
    /** UNTRANSLATED */
    organization: 'Organization',
    /** UNTRANSLATED */
    user_permissions_assignment_form_title: 'Add the user profile permissions',
    /** UNTRANSLATED */
    organization_permissions_assignment_form_title: 'Add the organization permissions',
    /** UNTRANSLATED */
    api_resource_permissions_assignment_form_title: 'Add the API resource permissions',
    /** UNTRANSLATED */
    user_data_permission_description_tips:
      'You can modify the description of the personal user data permissions via "Sign-in Experience > Content > Manage Language"',
    /** UNTRANSLATED */
    permission_description_tips:
      'When Logto is used as an Identity Provider (IdP) for authentication in third-party apps, and users are asked for authorization, this description appears on the consent screen.',
  },
  roles: {
    name_column: 'Rol',
    description_column: 'Açıklama',
    assign_button: 'Rolleri Ata',
    delete_description:
      'Bu işlem bu role bu makine-makine uygulamasından kaldıracaktır. Rol kendisi hala var olacak, ancak artık makine-makine uygulamasıyla ilişkilendirilmeyecektir.',
    deleted: '{{name}}, bu kullanıcıdan başarıyla kaldırıldı.',
    assign_title: "{{name}}'a rolleri atayın",
    assign_subtitle: '{{name}} için bir veya daha fazla rol yetkilendirin',
    assign_role_field: 'Rolleri Ata',
    role_search_placeholder: 'Rol adıyla arama yapın',
    added_text: '{{value, number}} eklendi',
    assigned_app_count: '{{value, number}} uygulamalar',
    confirm_assign: 'Rolleri Ata',
    role_assigned: 'Başarıyla rol(ler) atandı',
    search: "Rol adı, açıklaması veya ID'si ile arama yapın",
    empty: 'Mevcut rol yok',
  },
};

export default Object.freeze(application_details);
