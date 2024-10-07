const organization_template = {
  title: 'قالب المؤسسة',
  subtitle:
    'في تطبيقات SaaS متعددة المستأجرين ، يحدد قالب المؤسسة سياسات التحكم في الوصول المشتركة (الأذونات والأدوار) لعدة مؤسسات.',
  roles: {
    tab_name: 'أدوار المؤسسة',
    search_placeholder: 'البحث بواسطة اسم الدور',
    create_title: 'إنشاء دور المؤسسة',
    role_column: 'دور المؤسسة',
    permissions_column: 'الأذونات',
    placeholder_title: 'دور المؤسسة',
    placeholder_description:
      'دور المؤسسة هو تجميع للأذونات التي يمكن تعيينها للمستخدمين. يجب أن تكون الأذونات من الأذونات المؤسسة المحددة مسبقًا.',
    create_modal: {
      title: 'إنشاء دور المؤسسة',
      create: 'إنشاء دور',
      name: 'اسم الدور',
      description: 'الوصف',
      type: 'نوع الدور',
      created: 'تم إنشاء دور المؤسسة {{name}} بنجاح.',
    },
  },
  permissions: {
    tab_name: 'أذونات المؤسسة',
    search_placeholder: 'البحث بواسطة اسم الأذن',
    create_org_permission: 'إنشاء أذن المؤسسة',
    permission_column: 'أذن المؤسسة',
    description_column: 'الوصف',
    placeholder_title: 'أذن المؤسسة',
    placeholder_description: 'أذن المؤسسة يشير إلى التصريح بالوصول إلى مورد في سياق المؤسسة.',
    delete_confirm:
      'إذا تم حذف هذا الأذن ، فسيفقد جميع أدوار المؤسسة التي تحتوي على هذا الأذن هذا الأذن ، وسيفقد المستخدمون الذين لديهم هذا الأذن الوصول الذي تمنحه.',
    create_title: 'إنشاء أذن المؤسسة',
    edit_title: 'تحرير أذن المؤسسة',
    permission_field_name: 'اسم الأذن',
    description_field_name: 'الوصف',
    description_field_placeholder: 'قراءة سجل المواعيد',
    create_permission: 'إنشاء أذن',
    created: 'تم إنشاء أذن المؤسسة {{name}} بنجاح.',
  },
};

export default Object.freeze(organization_template);
