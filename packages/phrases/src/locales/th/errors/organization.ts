const organization = {
  require_membership: 'ผู้ใช้จะต้องเป็นสมาชิกขององค์กรก่อนจึงจะดำเนินการต่อได้',
  role_names_not_found:
    'ตรวจพบชื่อบทบาทที่ไม่ถูกต้อง: {{names,list(type:conjunction)}} กรุณาสร้างบทบาทเหล่านี้ก่อนจึงจะดำเนินการต่อได้',
  invitation_status_not_changeable: 'ไม่สามารถเปลี่ยนสถานะคำเชิญได้อีกต่อไป',
  accepted_user_id_required: 'จำเป็นต้องระบุ `acceptedUserId` เมื่อยอมรับคำเชิญ',
  invitee_already_member: 'ผู้ที่ได้รับเชิญเป็นสมาชิกขององค์กรอยู่แล้ว',
  accepted_user_email_mismatch: 'ผู้ใช้ที่ยอมรับต้องมีอีเมลเดียวกับผู้ที่ได้รับเชิญ',
  expires_at_in_future: 'ค่าของ `expiresAt` ต้องอยู่ในอนาคต',
};

export default Object.freeze(organization);
