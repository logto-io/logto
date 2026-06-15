const organization_role_details = {
  page_title: 'جزئیات نقش سازمان',
  back_to_org_roles: 'بازگشت به نقش‌های سازمان',
  delete_confirm:
    'این کار مجوزهای مرتبط با این نقش را از کاربران تحت تأثیر حذف می‌کند و روابط بین نقش‌های سازمان، اعضای سازمان و مجوزهای سازمان را پاک می‌کند.',
  deleted: 'نقش سازمان {{name}} با موفقیت حذف شد.',
  permissions: {
    tab: 'مجوزها',
    name_column: 'مجوز',
    description_column: 'توضیحات',
    type_column: 'نوع مجوز',
    type: {
      api: 'مجوز API',
      org: 'مجوز سازمان',
    },
    assign_permissions: 'اختصاص مجوزها',
    remove_permission: 'حذف مجوز',
    remove_confirmation:
      'اگر این مجوز حذف شود، کاربر با این نقش سازمان دسترسی اعطاشده توسط این مجوز را از دست می‌دهد.',
    removed: 'مجوز {{name}} با موفقیت از این نقش سازمان حذف شد',
    assign_description:
      'مجوزها را به نقش‌های این سازمان اختصاص دهید. این‌ها می‌توانند شامل مجوزهای سازمان و مجوزهای API باشند.',
    organization_permissions: 'مجوزهای سازمان',
    api_permissions: 'مجوزهای API',
    assign_organization_permissions: 'اختصاص مجوزهای سازمان',
    assign_api_permissions: 'اختصاص مجوزهای API',
  },
  general: {
    tab: 'عمومی',
    settings: 'تنظیمات',
    description:
      'نقش سازمان گروهی از مجوزهاست که می‌تواند به کاربران اختصاص یابد. مجوزها می‌توانند از مجوزهای ازپیش‌تعریف‌شده سازمان و مجوز API باشند.',
    name_field: 'نام',
    description_field: 'توضیحات',
    description_field_placeholder: 'کاربران با مجوز فقط مشاهده',
  },
};

export default Object.freeze(organization_role_details);
