const organization_role_details = {
  page_title: 'تفاصيل دور المؤسسة',
  back_to_org_roles: 'العودة إلى أدوار المؤسسة',
  delete_confirm:
    'بالقيام بذلك، ستتم إزالة الأذونات المرتبطة بهذا الدور من المستخدمين المتأثرين وحذف العلاقات بين أدوار المؤسسة وأعضاء المؤسسة وأذونات المؤسسة.',
  deleted: 'تم حذف دور المؤسسة {{name}} بنجاح.',
  permissions: {
    tab: 'الأذونات',
    name_column: 'الأذن',
    description_column: 'الوصف',
    type_column: 'نوع الأذن',
    type: {
      api: 'أذن API',
      org: 'أذن المؤسسة',
    },
    assign_permissions: 'تعيين الأذونات',
    remove_permission: 'إزالة الأذن',
    remove_confirmation:
      'إذا تمت إزالة هذا الأذن، سيفقد المستخدم الذي يحمل هذا الدور في الشركة الوصول الذي يتم منحه بهذا الأذن.',
    removed: 'تمت إزالة الأذن {{name}} من دور المؤسسة بنجاح',
    assign_description:
      'تعيين الأذونات للأدوار داخل هذه المؤسسة. يمكن أن تشمل هذه الأذونات كل من أذونات المؤسسة وأذونات API.',
    organization_permissions: 'أذونات المؤسسة',
    api_permissions: 'أذونات API',
    assign_organization_permissions: 'تعيين أذونات المؤسسة',
    assign_api_permissions: 'تعيين أذونات API',
  },
  general: {
    tab: 'عام',
    settings: 'الإعدادات',
    description:
      'دور المؤسسة هو تجميع للأذونات التي يمكن تعيينها للمستخدمين. يمكن أن تأتي الأذونات من أذونات المؤسسة المحددة مسبقًا وأذونات API.',
    name_field: 'الاسم',
    description_field: 'الوصف',
    description_field_placeholder: 'المستخدمين ذوي أذونات العرض فقط',
  },
};

export default Object.freeze(organization_role_details);
