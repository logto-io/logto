const profile = {
  name: 'الاسم',
  avatar: 'الصورة الرمزية',
  givenName: 'الاسم الأول',
  familyName: 'اسم العائلة',
  middleName: 'الاسم الأوسط',
  fullname: 'الاسم الكامل',
  nickname: 'الاسم المستعار',
  preferredUsername: 'اسم المستخدم المفضل',
  profile: 'الملف الشخصي',
  website: 'الموقع الإلكتروني',
  gender: 'الجنس',
  birthdate: 'تاريخ الميلاد',
  zoneinfo: 'المنطقة الزمنية',
  locale: 'اللغة والمنطقة',
  address: {
    formatted: 'العنوان',
    streetAddress: 'عنوان الشارع',
    locality: 'المدينة',
    region: 'الولاية/المقاطعة',
    postalCode: 'الرمز البريدي',
    country: 'الدولة',
  },
  gender_options: {
    female: 'أنثى',
    male: 'ذكر',
    prefer_not_to_say: 'أفضل عدم القول',
  },
  checkbox_value: {
    checked: 'نعم',
    unchecked: 'لا',
  },
  avatar_upload: {
    upload: 'رفع',
    remove: 'إزالة',
    uploading: 'جارٍ الرفع...',
    hint: 'الحجم الموصى به 1:1، بحد أقصى {{limit}}.',
    error_file_type: 'يجب أن يكون نوع الملف {{extensions}}.',
    error_file_size: 'يجب ألا يتجاوز حجم الملف {{limit}}.',
    error_upload: 'فشل رفع الصورة. يرجى المحاولة مرة أخرى.',
  },
};

export default Object.freeze(profile);
