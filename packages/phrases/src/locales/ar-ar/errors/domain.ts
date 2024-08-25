const domain = {
  not_configured: 'مزود اسم المضيف غير مكون.',
  cloudflare_data_missing: 'البيانات الخاصة بـ cloudflare مفقودة، يرجى التحقق.',
  cloudflare_unknown_error: 'حدث خطأ غير معروف عند طلب واجهة برمجة تطبيقات Cloudflare',
  cloudflare_response_error: 'تم الحصول على استجابة غير متوقعة من Cloudflare.',
  limit_to_one_domain: 'يمكنك فقط امتلاك نطاق مخصص واحد.',
  hostname_already_exists: 'هذا النطاق موجود بالفعل في خادمنا.',
  cloudflare_not_found: 'لا يمكن العثور على اسم المضيف في Cloudflare',
  domain_is_not_allowed: 'هذا النطاق غير مسموح به.',
};

export default Object.freeze(domain);
