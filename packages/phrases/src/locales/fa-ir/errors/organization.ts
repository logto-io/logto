const organizations = {
  require_membership: 'کاربر باید عضو سازمان باشد تا ادامه دهد.',
  role_names_not_found:
    'نام‌های نقش نامعتبر شناسایی شد: {{names,list(type:conjunction)}}. لطفاً ابتدا این نقش‌ها را ایجاد کنید.',
  invitation_status_not_changeable: 'وضعیت دعوت‌نامه دیگر قابل تغییر نیست.',
  accepted_user_id_required: 'هنگام پذیرش دعوت‌نامه، `acceptedUserId` الزامی است.',
  invitee_already_member: 'دعوت‌شونده در حال حاضر عضو سازمان است.',
  accepted_user_email_mismatch: 'کاربر پذیرنده باید همان ایمیل دعوت‌شونده را داشته باشد.',
  expires_at_in_future: 'مقدار `expiresAt` باید در آینده باشد.',
};

export default Object.freeze(organizations);
