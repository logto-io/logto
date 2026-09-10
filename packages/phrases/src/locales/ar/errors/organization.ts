const organization = {
  require_membership: 'يجب أن يكون المستخدم عضوًا في المنظمة للمتابعة.',
  role_names_not_found:
    'تم اكتشاف أسماء أدوار غير صالحة: {{names,list(type:conjunction)}}. يُرجى إنشاء هذه الأدوار أولاً قبل المتابعة.',
  invitation_status_not_changeable: 'لا يمكن تغيير حالة الدعوة بعد الآن.',
  accepted_user_id_required: '`acceptedUserId` مطلوب عند قبول دعوة.',
  invitee_already_member: 'المدعو عضو بالفعل في المنظمة.',
  accepted_user_email_mismatch:
    'يجب أن يكون للمستخدم الذي يقبل الدعوة نفس البريد الإلكتروني الخاص بالمدعو.',
  expires_at_in_future: 'يجب أن تكون قيمة `expiresAt` في المستقبل.',
};

export default Object.freeze(organization);
