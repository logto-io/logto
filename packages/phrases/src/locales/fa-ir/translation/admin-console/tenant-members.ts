const tenant_members = {
  members: 'اعضا',
  invitations: 'دعوت‌نامه‌ها',
  invite_members: 'دعوت اعضا',
  user: 'کاربر',
  roles: 'نقش‌ها',
  admin: 'مدیر',
  collaborator: 'همکار',
  invitation_status: 'وضعیت دعوت‌نامه',
  inviter: 'دعوت‌کننده',
  expiration_date: 'تاریخ انقضا',
  invite_modal: {
    title: 'دعوت افراد به Logto Cloud',
    subtitle: 'برای دعوت اعضا به یک سازمان، آن‌ها باید دعوت‌نامه را بپذیرند.',
    to: 'به',
    added_as: 'افزوده‌شده به‌عنوان نقش‌ها',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'در انتظار',
    accepted: 'پذیرفته‌شده',
    expired: 'منقضی‌شده',
    revoked: 'لغوشده',
  },
  invitation_empty_placeholder: {
    title: 'دعوت اعضای تیم',
    description:
      'مستأجر شما فعلاً هیچ عضو دعوت‌شده‌ای ندارد.\nبرای کمک به یکپارچه‌سازی، اعضا یا مدیران بیشتری اضافه کنید.',
  },
  menu_options: {
    edit: 'ویرایش نقش مستأجر',
    delete: 'حذف کاربر از مستأجر',
    resend_invite: 'ارسال مجدد دعوت‌نامه',
    revoke: 'لغو دعوت‌نامه',
    delete_invitation_record: 'حذف این رکورد دعوت‌نامه',
  },
  edit_modal: {
    title: 'تغییر نقش‌های {{name}}',
  },
  delete_user_confirm: 'آیا مطمئن هستید که می‌خواهید این کاربر را از این مستأجر حذف کنید؟',
  assign_admin_confirm:
    'آیا مطمئن هستید که می‌خواهید کاربر(ان) انتخاب‌شده را مدیر کنید؟ اعطای دسترسی مدیر به کاربر(ان) مجوزهای زیر را می‌دهد.<ul><li>تغییر طرح صورتحساب مستأجر</li><li>افزودن یا حذف همکاران</li><li>حذف مستأجر</li></ul>',
  revoke_invitation_confirm: 'آیا مطمئن هستید که می‌خواهید این دعوت‌نامه را لغو کنید؟',
  delete_invitation_confirm: 'آیا مطمئن هستید که می‌خواهید این رکورد دعوت‌نامه را حذف کنید؟',
  messages: {
    invitation_sent: 'دعوت‌نامه ارسال شد.',
    invitation_revoked: 'دعوت‌نامه لغو شد.',
    invitation_resend: 'دعوت‌نامه دوباره ارسال شد.',
    invitation_deleted: 'رکورد دعوت‌نامه حذف شد.',
  },
  errors: {
    email_required: 'ایمیل دعوت‌شونده الزامی است.',
    email_exists: 'آدرس ایمیل از قبل وجود دارد.',
    member_exists: 'این کاربر از قبل عضو این سازمان است.',
    pending_invitation_exists:
      'دعوت‌نامه در انتظار وجود دارد. ایمیل مرتبط را حذف کنید یا دعوت‌نامه را لغو کنید.',
    invalid_email: 'آدرس ایمیل نامعتبر است. لطفاً مطمئن شوید قالب درست است.',
    max_member_limit: 'به حداکثر تعداد اعضا ({{limit}}) برای این مستأجر رسیده‌اید.',
  },
};

export default Object.freeze(tenant_members);
