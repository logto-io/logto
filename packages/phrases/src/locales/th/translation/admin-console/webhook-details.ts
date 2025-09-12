const webhook_details = {
  page_title: 'รายละเอียด Webhook',
  back_to_webhooks: 'กลับไปที่เว็บฮุค',
  not_in_use: 'ไม่ได้ใช้งาน',
  success_rate: 'อัตราความสำเร็จ',
  requests: '{{value, number}} คำขอใน 24 ชม.',
  disable_webhook: 'ปิดใช้งานเว็บฮุค',
  disable_reminder:
    'คุณแน่ใจหรือไม่ว่าต้องการเปิดใช้งานเว็บฮุคนี้อีกครั้ง? เมื่อเปิดใช้งานแล้วจะไม่ส่งคำขอ HTTP ไปยัง URL ปลายทาง',
  webhook_disabled: 'ปิดใช้งานเว็บฮุคเรียบร้อยแล้ว',
  webhook_reactivated: 'เปิดใช้งานเว็บฮุคเรียบร้อยแล้ว',
  reactivate_webhook: 'เปิดใช้งานเว็บฮุคอีกครั้ง',
  delete_webhook: 'ลบเว็บฮุค',
  deletion_reminder: 'คุณกำลังลบเว็บฮุคนี้ หลังลบแล้วจะไม่ส่งคำขอ HTTP ไปยัง URL ปลายทาง',
  deleted: 'ลบเว็บฮุคเรียบร้อยแล้ว',
  settings_tab: 'การตั้งค่า',
  recent_requests_tab: 'คำขอล่าสุด (24 ชม.)',
  settings: {
    settings: 'การตั้งค่า',
    settings_description:
      'Webhook ช่วยให้คุณรับการอัปเดตแบบเรียลไทม์เกี่ยวกับเหตุการณ์เฉพาะในขณะที่เกิด โดยการส่งคำขอ POST ไปยัง URL ปลายทางของคุณ ซึ่งช่วยให้คุณสามารถดำเนินการได้ทันทีตามข้อมูลใหม่ที่ได้รับ',
    events: 'เหตุการณ์',
    events_description: 'เลือกเหตุการณ์ที่เป็นตัวกระตุ้นที่ Logto จะส่งคำขอ POST ไปยังคุณ',
    name: 'ชื่อ',
    endpoint_url: 'Endpoint URL',
    signing_key: 'Signing key',
    signing_key_tip:
      'เพิ่มคีย์ลับที่ Logto มอบให้ลงใน endpoint ของคุณในรูปแบบ request header เพื่อยืนยันความถูกต้องของ payload ของ webhook',
    regenerate: 'สร้างใหม่',
    regenerate_key_title: 'สร้าง Signing key ใหม่',
    regenerate_key_reminder:
      'คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยน Signing key? การสร้างใหม่จะมีผลทันที อย่าลืมอัปเดต Signing key ใน endpoint ของคุณด้วย',
    regenerated: 'สร้าง Signing key ใหม่เรียบร้อยแล้ว',
    custom_headers: 'Custom headers',
    custom_headers_tip:
      'คุณสามารถเพิ่ม header แบบกำหนดเองใน payload ของ webhook เพื่อให้ข้อมูลบริบทหรือข้อมูลเมตาเพิ่มเติมเกี่ยวกับเหตุการณ์นั้น ๆ',
    key_duplicated_error: 'ไม่สามารถใช้คีย์ซ้ำได้',
    key_missing_error: 'จำเป็นต้องระบุคีย์',
    value_missing_error: 'จำเป็นต้องระบุค่า',
    invalid_key_error: 'คีย์ไม่ถูกต้อง',
    invalid_value_error: 'ค่าไม่ถูกต้อง',
    test: 'ทดสอบ',
    test_webhook: 'ทดสอบเว็บฮุคของคุณ',
    test_webhook_description:
      'กำหนดค่าเว็บฮุคและทดสอบโดยใช้ตัวอย่าง payload สำหรับแต่ละเหตุการณ์ที่เลือก เพื่อยืนยันการรับและประมวลผลที่ถูกต้อง',
    send_test_payload: 'ส่ง payload ทดสอบ',
    test_result: {
      endpoint_url: 'Endpoint URL: {{url}}',
      message: 'ข้อความ: {{message}}',
      response_status: 'สถานะการตอบกลับ: {{status, number}}',
      response_body: 'เนื้อหาการตอบกลับ: {{body}}',
      request_time: 'เวลาที่ร้องขอ: {{time}}',
      test_success: 'ทดสอบเว็บฮุคไปยัง endpoint สำเร็จแล้ว',
    },
  },
};

export default Object.freeze(webhook_details);
