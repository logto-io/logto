const roles = {
  page_title: 'Roller',
  title: 'Roller',
  subtitle:
    'Roller, bir kullanıcının ne yapabileceğini belirleyen izinleri içerir. RBAC, kullanıcılara belirli işlemler için kaynaklara erişim vermek için roller kullanır.',
  create: 'Rol Oluştur',
  role_name: 'Rol adı',
  role_type: 'Rol tipi',
  show_role_type_button_text: 'Daha fazla seçenek göster',
  hide_role_type_button_text: 'Daha fazla seçeneği gizle',
  type_user: 'Kullanıcı rolü',
  type_machine_to_machine: 'Makine-makine uygulama rolü',
  role_description: 'Açıklama',
  role_name_placeholder: 'Rol adınızı girin',
  role_description_placeholder: 'Rol açıklamanızı girin',
  col_roles: 'Roller',
  col_type: 'Tür',
  col_description: 'Açıklama',
  col_assigned_entities: 'Atanan',
  user_counts: '{{count}} kullanıcılar',
  application_counts: '{{count}} uygulamalar',
  user_count: '{{count}} kullanıcı',
  application_count: '{{count}} uygulama',
  assign_permissions: 'İzinleri Ata',
  create_role_title: 'Rol Oluştur',
  create_role_description:
    'Uygulamalarınız için rolleri oluşturun ve yönetin. Roller, izin koleksiyonlarını içerir ve kullanıcılara atanabilir.',
  create_role_button: 'Rol Oluştur',
  role_created: '{{name}} rolü başarıyla oluşturuldu.',
  search: 'Rol adı, açıklama veya kimlik numarasına göre arama yapın',
  placeholder_title: 'Roller',
  placeholder_description:
    'Roller, kullanıcılara atanabilecek izinlerin gruplandırmasıdır. Rolleri oluşturmadan önce izin eklediğinizden emin olun.',
  assign_user_roles: 'Kullanıcı rolleri atayın',
  assign_m2m_roles: 'Makine ile makine rolleri atayın',
  management_api_access_notification:
    'Logto Yönetim API erişimi için yönetim API izinleri olan rolleri seçin <flag/>.',
  with_management_api_access_tip: 'Bu makine ile makine rolü, Logto yönetim API izinlerini içerir',
};

export default Object.freeze(roles);
