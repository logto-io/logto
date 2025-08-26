const tenant_members = {
  members: 'สมาชิก',
  invitations: 'คำเชิญ',
  invite_members: 'เชิญสมาชิก',
  user: 'ผู้ใช้',
  roles: 'บทบาท',
  admin: 'ผู้ดูแล',
  collaborator: 'ผู้ร่วมมือ',
  invitation_status: 'สถานะคำเชิญ',
  inviter: 'ผู้เชิญ',
  expiration_date: 'วันที่หมดอายุ',
  invite_modal: {
    title: 'เชิญคนเข้าร่วม Logto Cloud',
    subtitle: 'เพื่อเชิญสมาชิกเข้าร่วมองค์กร จำเป็นต้องให้พวกเขายอมรับคำเชิญนี้',
    to: 'ถึง',
    added_as: 'เพิ่มเป็นบทบาท',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'รอดำเนินการ',
    accepted: 'ยอมรับแล้ว',
    expired: 'หมดอายุ',
    revoked: 'เพิกถอนแล้ว',
  },
  invitation_empty_placeholder: {
    title: 'เชิญสมาชิกทีม',
    description:
      'ขณะนี้เทนแนนต์ของคุณยังไม่มีสมาชิกที่ได้รับเชิญ\nเพื่อช่วยในการผสานรวมของคุณ ลองเพิ่มสมาชิกหรือผู้ดูแลเพิ่มเติม',
  },
  menu_options: {
    edit: 'แก้ไขบทบาทเทนแนนต์',
    delete: 'ลบผู้ใช้ออกจากเทนแนนต์',
    resend_invite: 'ส่งคำเชิญอีกครั้ง',
    revoke: 'เพิกถอนคำเชิญ',
    delete_invitation_record: 'ลบบันทึกคำเชิญนี้',
  },
  edit_modal: {
    title: 'เปลี่ยนบทบาทของ {{name}}',
  },
  delete_user_confirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้ออกจากเทนแนนต์นี้?',
  assign_admin_confirm:
    'คุณแน่ใจหรือไม่ว่าต้องการตั้งผู้ใช้ที่เลือกให้เป็นผู้ดูแล? การให้สิทธิ์เป็นผู้ดูแลจะทำให้ผู้ใช้มีสิทธิ์ดังต่อไปนี้:<ul><li>เปลี่ยนแผนการเรียกเก็บเงินของเทนแนนต์</li><li>เพิ่มหรือลบผู้ร่วมมือ</li><li>ลบเทนแนนต์</li></ul>',
  revoke_invitation_confirm: 'คุณแน่ใจหรือไม่ว่าต้องการเพิกถอนคำเชิญนี้?',
  delete_invitation_confirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกคำเชิญนี้?',
  messages: {
    invitation_sent: 'ส่งคำเชิญแล้ว',
    invitation_revoked: 'เพิกถอนคำเชิญแล้ว',
    invitation_resend: 'ส่งคำเชิญใหม่อีกครั้ง',
    invitation_deleted: 'ลบบันทึกคำเชิญแล้ว',
  },
  errors: {
    email_required: 'จำเป็นต้องระบุอีเมลของผู้รับเชิญ',
    email_exists: 'ที่อยู่อีเมลนี้มีอยู่แล้ว',
    member_exists: 'ผู้ใช้นี้เป็นสมาชิกขององค์กรนี้อยู่แล้ว',
    pending_invitation_exists:
      'มีคำเชิญที่รอดำเนินการอยู่ กรุณาลบอีเมลที่เกี่ยวข้องหรือเพิกถอนคำเชิญ',
    invalid_email: 'ที่อยู่อีเมลไม่ถูกต้อง กรุณาตรวจสอบรูปแบบให้ถูกต้อง',
    max_member_limit: 'คุณถึงจำนวนสมาชิกสูงสุด ({{limit}}) สำหรับเทนแนนต์นี้แล้ว',
  },
};

export default Object.freeze(tenant_members);
