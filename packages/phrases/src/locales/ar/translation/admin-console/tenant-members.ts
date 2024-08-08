const tenant_members = {
  members: 'الأعضاء',
  invitations: 'الدعوات',
  invite_members: 'دعوة الأعضاء',
  user: 'المستخدم',
  roles: 'الأدوار',
  admin: 'المسؤول',
  collaborator: 'المشارك',
  invitation_status: 'حالة الدعوة',
  inviter: 'المدعو',
  expiration_date: 'تاريخ الانتهاء',
  invite_modal: {
    title: 'دعوة الأشخاص إلى Logto Cloud',
    subtitle: 'لدعوة الأعضاء إلى منظمة ما، يجب أن يقبلوا الدعوة.',
    to: 'إلى',
    added_as: 'تمت إضافتهم بصفة',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'قيد الانتظار',
    accepted: 'تم قبولها',
    expired: 'منتهية الصلاحية',
    revoked: 'تم إلغاؤها',
  },
  invitation_empty_placeholder: {
    title: 'دعوة أعضاء الفريق',
    description:
      'لا توجد أعضاء مدعوون حاليًا في المنظمة الخاصة بك.\nللمساعدة في التكامل الخاص بك، قم بإضافة المزيد من الأعضاء أو المسؤولين.',
  },
  menu_options: {
    edit: 'تعديل دور المستأجر',
    delete: 'إزالة المستخدم من المستأجر',
    resend_invite: 'إعادة إرسال الدعوة',
    revoke: 'إلغاء الدعوة',
    delete_invitation_record: 'حذف سجل الدعوة هذا',
  },
  edit_modal: {
    title: 'تغيير أدوار {{name}}',
  },
  delete_user_confirm: 'هل أنت متأكد أنك تريد إزالة هذا المستخدم من هذا المستأجر؟',
  assign_admin_confirm:
    'هل أنت متأكد أنك تريد جعل المستخدم (أو المستخدمين) المحددين مسؤولين؟ ستمنح صلاحيات المسؤول للمستخدم (أو المستخدمين) التالية.<ul><li>تغيير خطة الفوترة للمستأجر</li><li>إضافة أو إزالة المشاركين</li><li>حذف المستأجر</li></ul>',
  revoke_invitation_confirm: 'هل أنت متأكد أنك تريد إلغاء هذه الدعوة؟',
  delete_invitation_confirm: 'هل أنت متأكد أنك تريد حذف سجل الدعوة هذا؟',
  messages: {
    invitation_sent: 'تم إرسال الدعوة.',
    invitation_revoked: 'تم إلغاء الدعوة.',
    invitation_resend: 'تم إعادة إرسال الدعوة.',
    invitation_deleted: 'تم حذف سجل الدعوة.',
  },
  errors: {
    email_required: 'البريد الإلكتروني للمدعو مطلوب.',
    email_exists: 'عنوان البريد الإلكتروني موجود بالفعل.',
    member_exists: 'هذا المستخدم بالفعل عضو في هذه المنظمة.',
    pending_invitation_exists:
      'يوجد دعوة قيد الانتظار. قم بحذف البريد الإلكتروني المرتبط أو إلغاء الدعوة.',
    invalid_email: 'عنوان البريد الإلكتروني غير صالح. يرجى التأكد من أنه بالتنسيق الصحيح.',
    max_member_limit: 'لقد وصلت إلى الحد الأقصى لعدد الأعضاء ({{limit}}) لهذا المستأجر.',
  },
};

export default Object.freeze(tenant_members);
