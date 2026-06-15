const webhooks = {
  page_title: 'وب‌هوک‌ها',
  title: 'وب‌هوک‌ها',
  subtitle:
    'وب‌هوک ایجاد کنید تا به‌راحتی به‌روزرسانی‌های لحظه‌ای درباره رویدادهای خاص دریافت کنید.',
  create: 'ایجاد وب‌هوک',
  schemas: {
    interaction: 'تعامل کاربر',
    user: 'کاربر',
    organization: 'سازمان',
    role: 'نقش',
    scope: 'مجوز',
    organization_role: 'نقش سازمان',
    organization_scope: 'مجوز سازمان',
    security: 'امنیت',
  },
  table: {
    name: 'نام',
    events: 'رویدادها',
    success_rate: 'نرخ موفقیت (۲۴ ساعت)',
    requests: 'درخواست‌ها (۲۴ ساعت)',
  },
  placeholder: {
    title: 'وب‌هوک',
    description:
      'وب‌هوک ایجاد کنید تا از طریق درخواست‌های POST به URL مقصد، به‌روزرسانی‌های لحظه‌ای دریافت کنید. از رویدادهایی مانند «ایجاد حساب»، «ورود» و «بازنشانی رمز عبور» مطلع شوید و فوراً اقدام کنید.',
    create_webhook: 'ایجاد وب‌هوک',
  },
  create_form: {
    title: 'ایجاد وب‌هوک',
    subtitle:
      'وب‌هوک را اضافه کنید تا درخواست POST به URL مقصد با جزئیات رویدادهای کاربران ارسال شود.',
    events: 'رویدادها',
    events_description:
      'رویدادهای ماشه‌ای را انتخاب کنید که Logto درخواست POST را برای آن‌ها ارسال می‌کند.',
    name: 'نام',
    name_placeholder: 'نام وب‌هوک را وارد کنید',
    endpoint_url: 'URL مقصد',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip:
      'URL مقصد خود را وارد کنید که بار وب‌هوک هنگام وقوع رویداد به آن ارسال می‌شود.',
    create_webhook: 'ایجاد وب‌هوک',
    missing_event_error: 'باید حداقل یک رویداد انتخاب کنید.',
  },
  webhook_created: 'وب‌هوک {{name}} با موفقیت ایجاد شد.',
};

export default Object.freeze(webhooks);
