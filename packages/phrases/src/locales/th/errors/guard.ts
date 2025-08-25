const guard = {
  invalid_input: 'The request {{type}} is invalid.',
  invalid_pagination: 'The request pagination value is invalid.',
  can_not_get_tenant_id: 'Unable to get tenant id from request.',
  file_size_exceeded: 'ขนาดไฟล์เกินกำหนด',
  mime_type_not_allowed: 'ประเภท MIME ไม่ได้รับอนุญาต',
  not_allowed_for_admin_tenant: 'ไม่อนุญาตสำหรับผู้ดูแลระบบเทนนต์',
};

export default Object.freeze(guard);
