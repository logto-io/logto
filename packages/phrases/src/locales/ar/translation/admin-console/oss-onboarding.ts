const oss_onboarding = {
  page_title: 'الإعداد الأولي',
  title: 'أخبرنا قليلًا عنك',
  description: 'أخبرنا قليلًا عنك وعن مشروعك. يساعدنا ذلك على بناء Logto أفضل للجميع.',
  email: {
    label: 'البريد الإلكتروني',
    description: 'سنستخدم هذا العنوان إذا احتجنا إلى التواصل معك بشأن حسابك.',
    placeholder: 'email@example.com',
  },
  newsletter: 'تلقي تحديثات المنتج والتنبيهات الأمنية والمحتوى المختار من Logto.',
  project: {
    label: 'أستخدم Logto من أجل',
    personal: 'مشروع شخصي',
    company: 'مشروع شركة',
  },
  project_name: {
    label: 'اسم المشروع',
    placeholder: 'مشروعي',
  },
  company_name: {
    label: 'اسم الشركة',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'ما حجم شركتك؟',
  },
  errors: {
    email_required: 'البريد الإلكتروني مطلوب',
    email_invalid: 'أدخل بريدًا إلكترونيًا صالحًا',
    project_name_too_long: 'يجب ألا يتجاوز اسم المشروع 200 حرف',
  },
};

export default Object.freeze(oss_onboarding);
