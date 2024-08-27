const password_policy = {
  password_requirements: 'متطلبات كلمة المرور',
  minimum_length: 'الحد الأدنى للطول',
  minimum_length_description: 'يوصي NIST باستخدام <a>على الأقل 8 أحرف</a> للمنتجات على الويب.',
  minimum_length_error: 'يجب أن يكون الحد الأدنى للطول بين {{min}} و {{max}} (شاملاً).',
  minimum_required_char_types: 'الحد الأدنى لأنواع الأحرف المطلوبة',
  minimum_required_char_types_description:
    'أنواع الأحرف: الأحرف الكبيرة (A-Z)، الأحرف الصغيرة (a-z)، الأرقام (0-9)، والرموز الخاصة ({{symbols}}).',
  password_rejection: 'رفض كلمة المرور',
  compromised_passwords: 'رفض كلمات المرور المخترقة',
  breached_passwords: 'كلمات المرور المخترقة',
  breached_passwords_description:
    'رفض كلمات المرور التي تم العثور عليها سابقًا في قواعد البيانات المخترقة.',
  restricted_phrases: 'تقييد عبارات ضعيفة من الناحية الأمنية',
  restricted_phrases_tooltip:
    'يجب تجنب استخدام هذه العبارات في كلمة المرور ما لم تجمعها مع 3 أحرف إضافية أو أكثر.',
  repetitive_or_sequential_characters: 'أحرف متكررة أو متسلسلة',
  repetitive_or_sequential_characters_description: 'مثال: "AAAA"، "1234"، و "abcd".',
  user_information: 'معلومات المستخدم',
  user_information_description: 'مثال: عنوان البريد الإلكتروني، رقم الهاتف، اسم المستخدم، إلخ.',
  custom_words: 'كلمات مخصصة',
  custom_words_description: 'كلمات ذات صلة بالسياق، غير حساسة لحالة الأحرف، وكل كلمة في سطر منفصل.',
  custom_words_placeholder: 'اسم الخدمة الخاص بك، اسم الشركة، إلخ.',
};

export default Object.freeze(password_policy);
