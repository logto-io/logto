const custom_profile_fields = {
  table: {
    add_button: 'افزودن فیلد پروفایل',
    title: {
      field_label: 'برچسب فیلد',
      type: 'نوع',
      user_data_key: 'کلید داده کاربر',
    },
    placeholder: {
      title: 'جمع‌آوری پروفایل کاربر',
      description:
        'فیلدها را برای جمع‌آوری اطلاعات بیشتر پروفایل کاربر در هنگام ثبت‌نام سفارشی کنید.',
    },
  },
  type: {
    Text: 'متن',
    Number: 'عدد',
    Date: 'تاریخ',
    Checkbox: 'چک‌باکس (بولی)',
    Select: 'منوی کشویی (انتخاب تکی)',
    Url: 'URL',
    Regex: 'عبارت منظم',
    Address: 'آدرس (ترکیبی)',
    Fullname: 'نام کامل (ترکیبی)',
  },
  modal: {
    title: 'افزودن فیلد پروفایل',
    subtitle: 'فیلدها را برای جمع‌آوری اطلاعات بیشتر پروفایل کاربر در هنگام ثبت‌نام سفارشی کنید.',
    built_in_properties: 'داده‌های پایه کاربر',
    custom_properties: 'داده‌های سفارشی کاربر',
    custom_data_field_name: 'کلید داده کاربر',
    custom_data_field_input_placeholder:
      'کلید داده کاربر را وارد کنید، مثلاً `myFavoriteFieldName`',
    custom_field: {
      title: 'داده سفارشی',
      description:
        'هر ویژگی اضافی کاربر که می‌توانید برای پاسخ به نیازهای منحصربه‌فرد برنامه خود تعریف کنید.',
    },
    type_required: 'لطفاً یک نوع ویژگی انتخاب کنید',
    create_button: 'ایجاد فیلد پروفایل',
    avatar: {
      description:
        'به کاربران اجازه دهید در هنگام ثبت‌نام تصویر پروفایل خود را آپلود کنند. URL تصویر آپلود شده به عنوان آواتار کاربر ذخیره می‌شود.',
      storage_not_configured:
        'آپلود آواتار نیاز به یک ارائه‌دهنده ذخیره‌سازی پیکربندی شده دارد. قبل از افزودن این فیلد، ذخیره‌سازی را پیکربندی کنید.',
    },
  },
  details: {
    page_title: 'جزئیات فیلد پروفایل',
    back_to_sie: 'بازگشت به تجربه ورود',
    enter_field_name: 'نام فیلد پروفایل را وارد کنید',
    delete_description:
      'این عمل قابل بازگشت نیست. آیا مطمئن هستید که می‌خواهید این فیلد پروفایل را حذف کنید؟',
    field_deleted: 'فیلد پروفایل {{name}} با موفقیت حذف شد.',
    key: 'کلید داده کاربر',
    field_name: 'نام فیلد',
    field_type: 'نوع فیلد',
    settings: 'تنظیمات',
    settings_description:
      'فیلدها را برای جمع‌آوری اطلاعات بیشتر پروفایل کاربر در هنگام ثبت‌نام سفارشی کنید.',
    address_format: 'قالب آدرس',
    single_line_address: 'آدرس تک‌خطی',
    multi_line_address: 'آدرس چندخطی (مثلاً خیابان، شهر، استان، کد پستی، کشور)',
    components: 'اجزا',
    components_tip: 'اجزای تشکیل‌دهنده فیلد پیچیده را انتخاب کنید.',
    label: 'برچسب فیلد',
    label_placeholder: 'برچسب',
    label_tip: 'نیاز به بومی‌سازی دارید؟ زبان‌ها را در <a>تجربه ورود > محتوا</a> اضافه کنید',
    label_tooltip:
      'برچسب شناوری که هدف فیلد را مشخص می‌کند. داخل ورودی ظاهر می‌شود و هنگام فوکوس یا داشتن مقدار به بالای فیلد منتقل می‌شود.',
    placeholder: 'متن نگه‌دارنده فیلد',
    placeholder_placeholder: 'نگه‌دارنده',
    placeholder_tooltip:
      'مثال یا راهنمای قالب نمایش داده شده داخل ورودی. معمولاً پس از شناور شدن برچسب ظاهر می‌شود و باید کوتاه باشد (مثلاً MM/DD/YYYY).',
    description: 'توضیحات فیلد',
    description_placeholder: 'توضیحات',
    description_tooltip:
      'متن پشتیبان نمایش داده شده زیر فیلد متنی. از آن برای دستورالعمل‌های طولانی‌تر یا یادداشت‌های دسترسی استفاده کنید.',
    options: 'گزینه‌ها',
    options_tip:
      'هر گزینه را در یک خط جداگانه وارد کنید. از قالب مقدار:برچسب (مثلاً red:Red) استفاده کنید. همچنین می‌توانید فقط مقدار را وارد کنید؛ اگر برچسبی داده نشود، مقدار به عنوان برچسب نمایش داده می‌شود.',
    options_placeholder: 'value1:label1\nvalue2:label2\nvalue3:label3',
    regex: 'عبارت منظم',
    regex_tip: 'یک عبارت منظم برای اعتبارسنجی ورودی تعریف کنید.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'قالب تاریخ',
    date_format_us: 'MM/dd/yyyy (مثلاً ایالات متحده)',
    date_format_uk: 'dd/MM/yyyy (مثلاً بریتانیا و اروپا)',
    date_format_iso: 'yyyy-MM-dd (استاندارد بین‌المللی)',
    custom_date_format: 'قالب تاریخ سفارشی',
    custom_date_format_placeholder: 'قالب تاریخ سفارشی را وارد کنید. مثلاً "MM-dd-yyyy"',
    custom_date_format_tip: 'برای توکن‌های قالب‌بندی معتبر به مستندات <a>date-fns</a> مراجعه کنید.',
    input_length: 'طول ورودی',
    value_range: 'محدوده مقدار',
    min: 'حداقل',
    max: 'حداکثر',
    default_value: 'مقدار پیش‌فرض',
    checkbox_checked: 'علامت‌گذاری شده (درست)',
    checkbox_unchecked: 'علامت‌گذاری نشده (غلط)',
    required: 'اجباری',
    required_description:
      'وقتی فعال است، این فیلد باید توسط کاربران پر شود. وقتی غیرفعال است، این فیلد اختیاری است.',
    avatar_upload_description:
      'کاربران نهایی در هنگام ثبت‌نام آواتار خود را آپلود می‌کنند. مقدار ذخیره شده URL تصویر آپلود شده است.',
  },
};

export default Object.freeze(custom_profile_fields);
