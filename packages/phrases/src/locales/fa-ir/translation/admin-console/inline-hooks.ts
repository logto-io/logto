const inline_hooks = {
  page_title: 'هوک‌های درون‌خطی',
  title: 'هوک‌های درون‌خطی',
  subtitle:
    'کد سفارشی را در نقاط مشخصی از جریان احراز هویت اجرا کنید تا رفتار Logto را گسترش دهید.',
  status: {
    not_configured: 'پیکربندی نشده',
    configured: 'پیکربندی شده',
    enabled: 'فعال',
    disabled: 'غیرفعال',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'پس از تأیید عامل اول',
      description:
        'پس از تأیید اولین عامل احراز هویت و پیش از ادامه ورود، منطق سفارشی را اجرا کنید.',
    },
    post_sign_in: {
      name: 'پس از ورود',
      description: 'پس از ورود موفق کاربر، منطق سفارشی را اجرا کنید.',
    },
  },
};

export default Object.freeze(inline_hooks);
