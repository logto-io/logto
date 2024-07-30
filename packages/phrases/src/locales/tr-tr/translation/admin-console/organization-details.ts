const organization_details = {
  page_title: 'Kuruluş detayları',
  delete_confirmation:
    'Silindiğinde, tüm üyeler bu kuruluştaki üyeliklerini ve rollerini kaybedecek. Bu işlem geri alınamaz.',
  organization_id: 'Kuruluş Kimliği',
  settings_description:
    'Organizasyonlar, uygulamalarınıza erişebilen ekipleri, iş müşterilerini ve iş ortaklarını temsil eder.',
  name_placeholder: 'Kuruluşun adı, benzersiz olması gerekli değildir.',
  description_placeholder: 'Kuruluşun açıklaması.',
  member: 'Üye',
  member_other: 'Üyeler',
  add_members_to_organization: 'Üyeleri "{{name}}" kuruluşuna ekle',
  add_members_to_organization_description:
    'İsim, e-posta, telefon veya kullanıcı kimliği arayarak uygun kullanıcıları bulun. Var olan üyeler arama sonuçlarında gösterilmez.',
  add_with_organization_role: 'Kuruluş rol(ler)i ile ekle',
  user: 'Kullanıcı',
  application: 'Uygulama',
  application_other: 'Uygulamalar',
  add_applications_to_organization: 'Uygulamaları {{name}} kuruluşuna ekle',
  add_applications_to_organization_description:
    'Uygulama kimliği, adı veya açıklaması arayarak uygun uygulamaları bulun. Var olan uygulamalar arama sonuçlarında gösterilmez.',
  at_least_one_application: 'En az bir uygulama gereklidir.',
  remove_application_from_organization: 'Uygulamayı kuruluştan kaldır',
  remove_application_from_organization_description:
    'Uygulama kaldırıldığında, bu kuruluştaki ilişkilendirmesini ve rollerini kaybedecek. Bu işlem geri alınamaz.',
  search_application_placeholder: 'Uygulama kimliği, adı veya açıklaması arayarak arayın',
  roles: 'Kuruluş rolleri',
  authorize_to_roles: '"{{name}}"a aşağıdaki rolleri erişim yetkisi verin:',
  edit_organization_roles: 'Kuruluş rollerini düzenle',
  edit_organization_roles_title: '{{name}} kuruluş rollerini düzenle',
  remove_user_from_organization: 'Kullanıcıyı kuruluştan kaldır',
  remove_user_from_organization_description:
    'Kaldırıldığında, kullanıcı bu kuruluşta üyeliğini ve rollerini kaybedecek. Bu işlem geri alınamaz.',
  search_user_placeholder: 'İsim, e-posta, telefon veya kullanıcı kimliği ile ara',
  at_least_one_user: 'En az bir kullanıcı gereklidir.',
  organization_roles_tooltip: 'Bu kuruluştaki {{type}} için atanan roller.',
  custom_data: 'Özel veri',
  custom_data_tip:
    'Özel veri, kuruluşla ilişkili ek verileri depolamak için kullanılabilen bir JSON nesnesidir.',
  invalid_json_object: 'Geçersiz JSON nesnesi.',
  branding: {
    logo: 'Kuruluş logoları',
    logo_tooltip:
      'Bu logoyu oturum açma deneyiminde görüntülemek için kuruluş kimliğini geçirebilirsiniz; koyu mod etkinse logonun koyu sürümü omni oturum açma deneyimi ayarlarında gereklidir. <a>Devamını oku</a>',
  },
  jit: {
    title: 'Anında sağlama',
    description:
      'Kullanıcılar bazı kimlik doğrulama yöntemleriyle ilk oturum açtıklarında otomatik olarak kuruluşa katılabilir ve onlara roller atanır. Anında sağlama için karşılanacak gereksinimleri ayarlayabilirsiniz.',
    email_domain: 'E-posta alan adı sağlama',
    email_domain_description:
      'Doğrulanmış e-posta adresleriyle veya doğrulanmış e-posta adresleriyle sosyal oturum açma yoluyla kaydolan yeni kullanıcılar otomatik olarak kuruluşa katılacak. <a>Devamını oku</a>',
    email_domain_placeholder: 'Anında sağlama için e-posta alan adlarını girin',
    invalid_domain: 'Geçersiz alan adı',
    domain_already_added: 'Alan adı zaten eklendi',
    sso_enabled_domain_warning:
      'Bir veya daha fazla kurumsal SSO ile ilişkili e-posta alan adları girdiniz. Bu e-postalara sahip kullanıcılar standart SSO akışını takip edecek ve kurumsal SSO sağlama yapılandırılmadıkça bu kuruluşa sağlanmayacaktır.',
    enterprise_sso: 'Kurumsal SSO sağlama',
    no_enterprise_connector_set:
      'Henüz herhangi bir kurumsal SSO konektörü kurmadınız. Kurumsal SSO sağlamayı etkinleştirmek için önce bağlayıcılar ekleyin. <a>Kur</a>',
    add_enterprise_connector: 'Kurumsal bağlayıcı ekle',
    enterprise_sso_description:
      'Kurumsal SSO yoluyla ilk kez oturum açan yeni veya mevcut kullanıcılar otomatik olarak kuruluşa katılacak. <a>Devamını oku</a>',
    organization_roles: 'Varsayılan kuruluş rolleri',
    organization_roles_description:
      'Anında sağlama yoluyla kuruluşa katılan kullanıcılara roller atayın.',
  },
  mfa: {
    title: 'Çok faktörlü kimlik doğrulama (MFA)',
    tip: 'MFA gerektiğinde, MFA yapılandırılmamış kullanıcılar kuruluş jetonu değiştirmeye çalıştıklarında reddedilecektir. Bu ayar kullanıcı kimlik doğrulamasını etkilemez.',
    description:
      'Bu kuruluşa erişmek için kullanıcılardan çok faktörlü kimlik doğrulamayı yapılandırmalarını isteyin.',
    no_mfa_warning:
      'Kiracınız için hiçbir çok faktörlü kimlik doğrulama yöntemi etkin değil. En az bir <a>çok faktörlü kimlik doğrulama yöntemi</a> etkinleştirilene kadar kullanıcılar bu kuruluşa erişemeyecek.',
  },
};

export default Object.freeze(organization_details);
