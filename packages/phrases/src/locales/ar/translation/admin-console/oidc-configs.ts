const oidc_configs = {
  sessions_card_title: 'جلسات Logto',
  sessions_card_description:
    'خصّص سياسة الجلسات المخزنة في خادم تفويض Logto. تسجّل حالة المصادقة العامة للمستخدم لتمكين تسجيل الدخول الأحادي (SSO) والسماح بإعادة المصادقة الصامتة عبر التطبيقات.',
  session_max_ttl_in_days: 'الحد الأقصى لمدة صلاحية الجلسة (TTL) بالأيام',
  session_max_ttl_in_days_tip:
    'حد زمني مطلق لعمر الجلسة يبدأ من وقت إنشائها. بغض النظر عن النشاط، تنتهي الجلسة عند انقضاء هذه المدة الثابتة.',
  oss_notice:
    'بالنسبة إلى Logto OSS، يلزم إعادة تشغيل المثيل بعد تحديث أي إعدادات OIDC (بما في ذلك إعدادات الجلسة و<keyRotationsLink>تدوير المفاتيح</keyRotationsLink>) حتى تدخل التغييرات حيز التنفيذ. ولتطبيق جميع تحديثات إعدادات OIDC تلقائيا دون إعادة تحميل الخدمة، <centralCacheLink>فعّل التخزين المؤقت المركزي</centralCacheLink>.',
  cloud_private_key_rotation_notice:
    'في Logto Cloud، تصبح عملية تدوير المفتاح الخاص فعالة بعد فترة سماح مدتها 4 ساعات.',
};

export default Object.freeze(oidc_configs);
