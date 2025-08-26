const webhooks = {
  page_title: 'Webhook',
  title: 'Webhook',
  subtitle:
    'สร้าง webhook เพื่อรับข้อมูลอัปเดตแบบเรียลไทม์เกี่ยวกับเหตุการณ์ที่ระบุได้อย่างง่ายดาย',
  create: 'สร้าง Webhook',
  schemas: {
    interaction: 'ปฏิสัมพันธ์ของผู้ใช้',
    user: 'ผู้ใช้',
    organization: 'องค์กร',
    role: 'บทบาท',
    scope: 'สิทธิ์',
    organization_role: 'บทบาทในองค์กร',
    organization_scope: 'สิทธิ์ในองค์กร',
  },
  table: {
    name: 'ชื่อ',
    events: 'เหตุการณ์',
    success_rate: 'อัตราความสำเร็จ (24 ชม.)',
    requests: 'คำขอ (24 ชม.)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'สร้าง webhook เพื่อรับข้อมูลอัปเดตแบบเรียลไทม์ผ่าน POST request ไปยัง endpoint URL ของคุณ อัปเดตทันทีเมื่อมีเหตุการณ์ เช่น "สร้างบัญชี", "เข้าสู่ระบบ", และ "รีเซ็ตรหัสผ่าน"',
    create_webhook: 'สร้าง Webhook',
  },
  create_form: {
    title: 'สร้าง Webhook',
    subtitle:
      'เพิ่ม Webhook เพื่อส่ง POST request ไปยัง endpoint URL พร้อมรายละเอียดของ event ที่เกี่ยวข้องกับผู้ใช้',
    events: 'เหตุการณ์',
    events_description: 'เลือกเหตุการณ์ที่ต้องการให้ Logto ส่ง POST request',
    name: 'ชื่อ',
    name_placeholder: 'กรอกชื่อ webhook',
    endpoint_url: 'Endpoint URL',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip: 'กรอก URL ของ endpoint ที่จะได้รับ payload ของ webhook เมื่อเกิด event ขึ้น',
    create_webhook: 'สร้าง webhook',
    missing_event_error: 'คุณต้องเลือกเหตุการณ์อย่างน้อยหนึ่งรายการ',
  },
  webhook_created: 'สร้าง webhook {{name}} สำเร็จแล้ว',
};

export default Object.freeze(webhooks);
