const errors = {
  something_went_wrong: 'اوه! مشکلی پیش آمد.',
  page_not_found: 'صفحه پیدا نشد',
  unknown_server_error: 'خطای ناشناخته سرور رخ داد',
  empty: 'داده‌ای وجود ندارد',
  missing_total_number: 'یافتن Total-Number در هدرهای پاسخ ممکن نیست',
  invalid_uri_format: 'فرمت URI نامعتبر است',
  invalid_origin_format: 'فرمت origin در URI نامعتبر است',
  invalid_json_format: 'فرمت JSON نامعتبر است',
  invalid_parameters_format: 'فرمت پارامترها نامعتبر است',
  invalid_regex: 'عبارت منظم نامعتبر است',
  invalid_error_message_format: 'فرمت پیام خطا نامعتبر است.',
  required_field_missing: 'لطفاً {{field}} را وارد کنید',
  required_field_missing_plural: 'باید حداقل یک {{field}} وارد کنید',
  more_details: 'جزئیات بیشتر',
  username_pattern_error:
    'نام کاربری باید فقط شامل حروف، اعداد یا زیرخط باشد و نباید با عدد شروع شود.',
  email_pattern_error: 'آدرس ایمیل نامعتبر است.',
  phone_pattern_error: 'شماره تلفن نامعتبر است.',
  insecure_contexts: 'محیط‌های ناامن (غیر HTTPS) پشتیبانی نمی‌شوند.',
  unexpected_error: 'خطای غیرمنتظره‌ای رخ داد.',
  not_found: '404 پیدا نشد',
  create_internal_role_violation:
    'شما در حال ایجاد یک نقش داخلی جدید هستید که توسط Logto مجاز نیست. نامی را امتحان کنید که با "#internal:" شروع نشود.',
  should_be_an_integer: 'باید یک عدد صحیح باشد.',
  number_should_be_between_inclusive:
    'عدد باید بین {{min}} و {{max}} باشد (هر دو طرف شامل می‌شوند).',
};

export default Object.freeze(errors);
