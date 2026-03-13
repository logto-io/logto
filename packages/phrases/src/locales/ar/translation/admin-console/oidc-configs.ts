const oidc_configs = {
  sessions_card_title: 'جلسات Logto',
  sessions_card_description:
    'خصّص سياسة الجلسات المخزنة في خادم تفويض Logto. تسجّل حالة المصادقة العامة للمستخدم لتمكين تسجيل الدخول الأحادي (SSO) والسماح بإعادة المصادقة الصامتة عبر التطبيقات.',
  session_max_ttl_in_days: 'الحد الأقصى لمدة صلاحية الجلسة (TTL) بالأيام',
  session_max_ttl_in_days_tip:
    'حد زمني مطلق لعمر الجلسة يبدأ من وقت إنشائها. بغض النظر عن النشاط، تنتهي الجلسة عند انقضاء هذه المدة الثابتة.',
};

export default Object.freeze(oidc_configs);
