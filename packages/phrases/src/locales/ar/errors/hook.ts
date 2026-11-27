const hook = {
  missing_events: 'يجب أن تقدم على الأقل حدث واحد.',
  send_test_payload_failed: 'فشل في إرسال حمولة الاختبار: {{message}}',
  endpoint_responded_with_error: 'ردت النقطة النهائية بخطأ.',
  disabled: 'الخطاف معطل ولا يمكنه إعادة تسليم الأحداث.',
  log_not_permanently_failed: 'يمكن إعادة تسليم عمليات تسليم الخطاف التي فشلت بشكل دائم فقط.',
  invalid_log_payload: 'لا يحتوي إدخال سجل الخطاف على حمولة طلب صالحة لإعادة التسليم.',
  redelivery_in_progress: 'هناك عملية تسليم أو إعادة تسليم قيد التنفيذ بالفعل لحدث الخطاف هذا.',
};

export default Object.freeze(hook);
