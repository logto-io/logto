const api_resource_details = {
  page_title: 'تفاصيل مورد واجهة برمجة التطبيق',
  back_to_api_resources: 'العودة إلى موارد واجهة برمجة التطبيق',
  general_tab: 'عام',
  permissions_tab: 'الصلاحيات',
  settings: 'الإعدادات',
  settings_description:
    'موارد واجهة برمجة التطبيق، المعروفة أيضًا بمؤشرات الموارد، تشير إلى الخدمات أو الموارد المستهدفة التي يتم طلبها، عادةً، بتنسيق متغير URI يمثل هوية المورد.',
  management_api_settings_description:
    'واجهة برمجة التطبيق لـ Logto هي مجموعة شاملة من واجهات برمجة التطبيق التي تمكن المسؤولين من إدارة مجموعة واسعة من المهام المتعلقة بالهوية، وفرض سياسات الأمان، والامتثال للتشريعات والمعايير.',
  management_api_notice:
    'تمثل هذه الواجهة برمجة التطبيق كيان Logto ولا يمكن تعديلها أو حذفها. قم بإنشاء تطبيق من الجهاز إلى التطبيق لاستدعاء واجهة برمجة التطبيق لـ Logto. <a>تعرف على المزيد</a>',
  token_expiration_time_in_seconds: 'وقت انتهاء صلاحية الرمز (بالثواني)',
  token_expiration_time_in_seconds_placeholder: 'أدخل وقت انتهاء صلاحية الرمز الخاص بك',
  delete_description:
    'لا يمكن التراجع عن هذا الإجراء. سيتم حذف المورد واجهة برمجة التطبيق بشكل دائم. يرجى إدخال اسم مورد واجهة برمجة التطبيق <span>{{name}}</span> للتأكيد.',
  enter_your_api_resource_name: 'أدخل اسم مورد واجهة برمجة التطبيق الخاص بك',
  api_resource_deleted: 'تم حذف مورد واجهة برمجة التطبيق {{name}} بنجاح',
  permission: {
    create_button: 'إنشاء صلاحية',
    create_title: 'إنشاء صلاحية',
    create_subtitle: 'تعريف الصلاحيات (نطاقات) المطلوبة لهذه واجهة برمجة التطبيق.',
    confirm_create: 'إنشاء صلاحية',
    edit_title: 'تحرير صلاحية واجهة برمجة التطبيق',
    edit_subtitle: 'تعريف الصلاحيات (نطاقات) المطلوبة لواجهة برمجة التطبيق {{resourceName}}.',
    name: 'اسم الصلاحية',
    name_placeholder: 'قراءة:مورد',
    forbidden_space_in_name: 'يجب ألا يحتوي اسم الصلاحية على أي مسافات.',
    description: 'الوصف',
    description_placeholder: 'القدرة على قراءة الموارد',
    permission_created: 'تم إنشاء الصلاحية {{name}} بنجاح',
    delete_description:
      'إذا تم حذف هذه الصلاحية، فسيفقد المستخدم الذي يمتلك هذه الصلاحية الوصول الذي تمنحه.',
    deleted: 'تم حذف الصلاحية "{{name}}" بنجاح.',
  },
};

export default Object.freeze(api_resource_details);
