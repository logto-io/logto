const role = {
  name_in_use: 'Bu rol adı {{name}} zaten kullanımda',
  scope_exists: 'Bu kapsam kimliği {{scopeId}} zaten bu role eklendi',
  management_api_scopes_not_assignable_to_user_role:
    'Kullanıcı rolüne yönetim API kapsamları atanamaz.',
  user_exists: 'Bu kullanıcı kimliği {{userId}} zaten bu role eklendi',
  application_exists: 'Bu uygulama kimliği {{applicationId}} zaten bu role eklendi',
  default_role_missing:
    'Varsayılan rol adlarından bazıları veritabanında mevcut değil, lütfen önce rolleri oluşturduğunuzdan emin olun',
  internal_role_violation:
    'Logto tarafından yasaklanan dahili bir rolü güncelleme veya silmeye çalışıyor olabilirsiniz. Yeni bir rol oluşturuyorsanız, "#internal:" ile başlamayan başka bir isim deneyin.',
};

export default Object.freeze(role);
