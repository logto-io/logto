const guard = {
  invalid_input: 'درخواست {{type}} نامعتبر است.',
  invalid_pagination: 'مقدار صفحه‌بندی درخواست نامعتبر است.',
  unsupported_pagination_parameter:
    "پارامتر پرس‌وجوی '{{parameter}}' در حالت صفحه‌بندی {{mode}} پشتیبانی نمی‌شود.",
  can_not_get_tenant_id: 'امکان دریافت شناسه مستأجر از درخواست نیست.',
  file_size_exceeded: 'اندازه فایل بیش از حد مجاز است.',
  mime_type_not_allowed: 'نوع MIME مجاز نیست.',
  not_allowed_for_admin_tenant: 'برای مستأجر مدیر مجاز نیست.',
};

export default Object.freeze(guard);
