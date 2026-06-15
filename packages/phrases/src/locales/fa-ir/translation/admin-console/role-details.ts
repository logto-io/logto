const role_details = {
  back_to_roles: 'بازگشت به نقش‌ها',
  identifier: 'شناسه',
  delete_description:
    'این کار مجوزهای مرتبط با این نقش را از کاربران تحت تأثیر حذف می‌کند و نگاشت بین نقش‌ها، کاربران و مجوزها را پاک می‌کند.',
  role_deleted: '{{name}} با موفقیت حذف شد.',
  general_tab: 'عمومی',
  users_tab: 'کاربران',
  m2m_apps_tab: 'برنامه‌های ماشین به ماشین',
  permissions_tab: 'مجوزها',
  settings: 'تنظیمات',
  settings_description:
    'نقش‌ها گروهی از مجوزها هستند که می‌توانند به کاربران اختصاص یابند. آن‌ها همچنین راهی برای تجمیع مجوزهای تعریف‌شده برای APIهای مختلف فراهم می‌کنند و افزودن، حذف یا تنظیم مجوزها را نسبت به اختصاص جداگانه به کاربران کارآمدتر می‌سازد.',
  field_name: 'نام',
  field_description: 'توضیحات',
  field_is_default: 'نقش پیش‌فرض',
  field_is_default_description:
    'این نقش را به‌عنوان نقش پیش‌فرض برای کاربران جدید تنظیم کنید. چند نقش پیش‌فرض قابل تنظیم است. این بر نقش‌های پیش‌فرض کاربران ایجادشده از طریق Management API نیز تأثیر می‌گذارد.',
  type_m2m_role_tag: 'ماشین به ماشین',
  type_user_role_tag: 'کاربر',
  m2m_role_notification:
    'این نقش ماشین به ماشین را به یک برنامه ماشین به ماشین اختصاص دهید تا دسترسی به منابع API مرتبط اعطا شود. اگر هنوز نکرده‌اید، ابتدا <a>یک برنامه ماشین به ماشین ایجاد کنید</a>.',
  permission: {
    assign_button: 'اختصاص مجوزها',
    assign_title: 'اختصاص مجوزها',
    assign_subtitle:
      'مجوزها را به این نقش اختصاص دهید. نقش مجوزهای اضافه‌شده را دریافت می‌کند و کاربران با این نقش آن مجوزها را به ارث می‌برند.',
    assign_form_field: 'اختصاص مجوزها',
    added_text: '{{count, number}} مجوز اضافه شد',
    added_text_other: '{{count, number}} مجوز اضافه شد',
    api_permission_count: '{{count, number}} مجوز',
    api_permission_count_other: '{{count, number}} مجوز',
    confirm_assign: 'اختصاص مجوزها',
    permission_assigned: 'مجوزهای انتخاب‌شده با موفقیت به این نقش اختصاص یافتند',
    deletion_description:
      'اگر این مجوز حذف شود، کاربر تحت تأثیر با این نقش دسترسی اعطاشده توسط این مجوز را از دست می‌دهد.',
    permission_deleted: 'مجوز «{{name}}» با موفقیت از این نقش حذف شد',
    empty: 'مجوزی در دسترس نیست',
  },
  users: {
    assign_button: 'اختصاص کاربران',
    name_column: 'کاربر',
    app_column: 'برنامه',
    latest_sign_in_column: 'آخرین ورود',
    delete_description: 'در مجموعه کاربران شما باقی می‌ماند اما مجوز این نقش را از دست می‌دهد.',
    deleted: '{{name}} با موفقیت از این نقش حذف شد',
    assign_title: 'اختصاص کاربران به {{name}}',
    assign_subtitle: 'کاربران مناسب را با جستجوی نام، ایمیل، تلفن یا شناسه کاربر پیدا کنید.',
    assign_field: 'اختصاص کاربران',
    confirm_assign: 'اختصاص کاربران',
    assigned_toast_text: 'کاربران انتخاب‌شده با موفقیت به این نقش اختصاص یافتند',
    empty: 'کاربری در دسترس نیست',
  },
  applications: {
    assign_button: 'اختصاص برنامه‌های ماشین به ماشین',
    name_column: 'برنامه',
    app_column: 'برنامه ماشین به ماشین',
    description_column: 'توضیحات',
    delete_description: 'در مجموعه برنامه‌های شما باقی می‌ماند اما مجوز این نقش را از دست می‌دهد.',
    deleted: '{{name}} با موفقیت از این نقش حذف شد',
    assign_title: 'اختصاص برنامه‌های ماشین به ماشین به {{name}}',
    assign_subtitle:
      'برنامه‌های ماشین به ماشین مناسب را با جستجوی نام، توضیحات یا شناسه برنامه پیدا کنید.',
    assign_field: 'اختصاص برنامه‌های ماشین به ماشین',
    confirm_assign: 'اختصاص برنامه‌های ماشین به ماشین',
    assigned_toast_text: 'برنامه‌های انتخاب‌شده با موفقیت به این نقش اختصاص یافتند',
    empty: 'برنامه‌ای در دسترس نیست',
  },
};

export default Object.freeze(role_details);
