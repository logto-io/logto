const organization_template = {
  title: 'قالب سازمان',
  subtitle:
    'در برنامه‌های SaaS چندمستأجری، قالب سازمان سیاست‌های کنترل دسترسی مشترک (مجوزها و نقش‌ها) را برای چندین سازمان تعریف می‌کند.',
  roles: {
    tab_name: 'نقش‌های سازمان',
    search_placeholder: 'جستجو بر اساس نام نقش',
    create_title: 'ایجاد نقش سازمان',
    role_column: 'نقش سازمان',
    permissions_column: 'مجوزها',
    placeholder_title: 'نقش سازمان',
    placeholder_description:
      'نقش سازمان گروهی از مجوزهاست که می‌تواند به کاربران اختصاص یابد. مجوزها باید از مجوزهای ازپیش‌تعریف‌شده سازمان باشند.',
    create_modal: {
      title: 'ایجاد نقش سازمان',
      create: 'ایجاد نقش',
      name: 'نام نقش',
      description: 'توضیحات',
      type: 'نوع نقش',
      created: 'نقش سازمان {{name}} با موفقیت ایجاد شد.',
    },
  },
  permissions: {
    tab_name: 'مجوزهای سازمان',
    search_placeholder: 'جستجو بر اساس نام مجوز',
    create_org_permission: 'ایجاد مجوز سازمان',
    permission_column: 'مجوز سازمان',
    description_column: 'توضیحات',
    placeholder_title: 'مجوز سازمان',
    placeholder_description: 'مجوز سازمان به معنای اجازه دسترسی به یک منبع در زمینه سازمان است.',
    delete_confirm:
      'اگر این مجوز حذف شود، همه نقش‌های سازمان شامل این مجوز آن را از دست می‌دهند و کاربرانی که این مجوز را داشتند دسترسی اعطاشده را از دست می‌دهند.',
    create_title: 'ایجاد مجوز سازمان',
    edit_title: 'ویرایش مجوز سازمان',
    permission_field_name: 'نام مجوز',
    description_field_name: 'توضیحات',
    description_field_placeholder: 'مشاهده تاریخچه قرارها',
    create_permission: 'ایجاد مجوز',
    created: 'مجوز سازمان {{name}} با موفقیت ایجاد شد.',
  },
};

export default Object.freeze(organization_template);
