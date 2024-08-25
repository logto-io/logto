const guard = {
  invalid_input: 'الطلب {{type}} غير صالح.',
  invalid_pagination: 'قيمة ترقيم الصفحات في الطلب غير صالحة.',
  can_not_get_tenant_id: 'غير قادر على الحصول على معرف المستأجر من الطلب.',
  file_size_exceeded: 'تم تجاوز حجم الملف.',
  mime_type_not_allowed: 'نوع MIME غير مسموح به.',
  not_allowed_for_admin_tenant: 'غير مسموح للمستأجر الإداري.',
};

export default Object.freeze(guard);
