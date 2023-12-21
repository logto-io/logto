const application = {
  invalid_type: 'Sadece makine ile makine uygulamaları rollerle ilişkilendirilebilir.',
  role_exists: 'Bu uygulamaya zaten {{roleId}} kimlikli bir rol eklenmiş.',
  invalid_role_type: 'Kullanıcı tipi rolü makine ile makine uygulamasına atayamaz.',
  invalid_third_party_application_type:
    'Sadece geleneksel web uygulamaları üçüncü taraf uygulaması olarak işaretlenebilir.',
  third_party_application_only: 'Bu özellik sadece üçüncü taraf uygulamalar için geçerlidir.',
  user_consent_scopes_not_found: 'Geçersiz kullanıcı onay kapsamları.',
};

export default Object.freeze(application);
