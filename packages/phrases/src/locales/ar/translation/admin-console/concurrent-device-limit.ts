const concurrent_device_limit = {
  title: 'حد الأجهزة المتزامنة',
  description: 'حدد عدد الأجهزة التي يمكن لكل مستخدم أن يكون مسجل الدخول عليها لهذا التطبيق.',
  enable: 'تمكين حد الأجهزة المتزامنة',
  enable_description:
    'عند التمكين، يفرض Logto الحد الأقصى للتصاريح النشطة لكل مستخدم لهذا التطبيق.',
  field: 'حد الأجهزة المتزامنة لكل تطبيق',
  field_description:
    'حدد عدد الأجهزة التي يمكن أن يكون المستخدم مسجلًا الدخول إليها في نفس الوقت. يفرض Logto ذلك عن طريق تحديد التصاريح النشطة ويقوم تلقائيًا بإلغاء أقدم تصريح عند تجاوز الحد.',
  field_placeholder: 'اتركه فارغًا لعدم وجود حد',
  should_be_greater_than_zero: 'يجب أن يكون أكبر من 0.',
};

export default Object.freeze(concurrent_device_limit);
