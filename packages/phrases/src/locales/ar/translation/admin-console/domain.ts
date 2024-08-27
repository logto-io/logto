const domain = {
  status: {
    connecting: 'جارٍ الاتصال...',
    in_use: 'قيد الاستخدام',
    failed_to_connect: 'فشل الاتصال',
  },
  update_endpoint_notice:
    'لا تنسى تحديث النطاق لعنوان URI لموصل الشبكة الاجتماعية ونقطة النهاية الخاصة بـ Logto في تطبيقك إذا كنت ترغب في استخدام نطاق مخصص للميزات. <a>{{link}}</a>',
  error_hint: 'تأكد من تحديث سجلات DNS الخاصة بك. سنستمر في التحقق كل {{value}} ثانية.',
  custom: {
    custom_domain: 'نطاق مخصص',
    custom_domain_description:
      'تحسين العلامة التجارية الخاصة بك عن طريق استخدام نطاق مخصص. سيتم استخدام هذا النطاق في تجربة تسجيل الدخول الخاصة بك.',
    custom_domain_field: 'نطاق مخصص',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'إضافة نطاق',
    invalid_domain_format:
      'يرجى تقديم عنوان URL صالح للنطاق مع حد أدنى من ثلاثة أجزاء ، على سبيل المثال "your.domain.com".',
    verify_domain: 'التحقق من النطاق',
    enable_ssl: 'تمكين SSL',
    checking_dns_tip:
      'بعد تكوين سجلات DNS ، سيتم تشغيل العملية تلقائيًا وقد تستغرق حتى 24 ساعة. يمكنك ترك هذه الواجهة أثناء تشغيلها.',
    enable_ssl_tip:
      'سيتم تشغيل تمكين SSL تلقائيًا وقد يستغرق حتى 24 ساعة. يمكنك ترك هذه الواجهة أثناء تشغيلها.',
    generating_dns_records: 'جارٍ إنشاء سجلات DNS...',
    add_dns_records: 'يرجى إضافة هذه السجلات DNS إلى موفر خدمة DNS الخاص بك.',
    dns_table: {
      type_field: 'النوع',
      name_field: 'الاسم',
      value_field: 'القيمة',
    },
    deletion: {
      delete_domain: 'حذف النطاق',
      reminder: 'حذف النطاق المخصص',
      description: 'هل أنت متأكد أنك تريد حذف هذا النطاق المخصص؟',
      in_used_description: 'هل أنت متأكد أنك تريد حذف هذا النطاق المخصص "<span>{{domain}}</span>"؟',
      in_used_tip:
        'إذا قمت بإعداد هذا النطاق المخصص في موفر موصل الشبكة الاجتماعية أو نقطة النهاية التطبيقية الخاصة بك من قبل ، فسيتعين عليك تعديل عنوان URI إلى النطاق الافتراضي لـ Logto "<span>{{domain}}</span>" أولاً. هذا ضروري لعمل زر تسجيل الدخول الاجتماعي بشكل صحيح.',
      deleted: 'تم حذف النطاق المخصص بنجاح!',
    },
  },
  default: {
    default_domain: 'النطاق الافتراضي',
    default_domain_description:
      'يوفر Logto نطاقًا افتراضيًا معينًا مسبقًا ، جاهزًا للاستخدام دون أي إعدادات إضافية. يعمل هذا النطاق الافتراضي كخيار احتياطي حتى إذا قمت بتمكين نطاق مخصص.',
    default_domain_field: 'النطاق الافتراضي لـ Logto',
  },
  custom_endpoint_note:
    'يمكنك تخصيص اسم النطاق لهذه النقاط النهائية حسب متطلباتك. اختر إما "{{custom}}" أو "{{default}}".',
  custom_social_callback_url_note:
    'يمكنك تخصيص اسم النطاق لهذا العنوان URI لمطابقة نقطة النهاية لتطبيقك. اختر إما "{{custom}}" أو "{{default}}".',
  custom_acs_url_note:
    'يمكنك تخصيص اسم النطاق لهذا العنوان URI لمطابقة عنوان خدمة استهلاك مزود الهوية الخاص بك. اختر إما "{{custom}}" أو "{{default}}".',
};

export default Object.freeze(domain);
