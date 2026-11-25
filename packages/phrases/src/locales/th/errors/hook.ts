const hook = {
  missing_events: 'คุณต้องระบุเหตุการณ์อย่างน้อยหนึ่งรายการ',
  send_test_payload_failed: 'ส่งข้อมูลทดสอบไม่สำเร็จ: {{message}}',
  endpoint_responded_with_error: 'ปลายทางตอบกลับด้วยข้อผิดพลาด',
  disabled: 'ฮุกถูกปิดใช้งานอยู่และไม่สามารถส่งเหตุการณ์ซ้ำได้',
  log_not_permanently_failed: 'สามารถส่งซ้ำได้เฉพาะการส่งเว็บฮุกที่ล้มเหลวถาวรเท่านั้น',
  invalid_log_payload: 'รายการบันทึกเว็บฮุกไม่มีเพย์โหลดคำขอที่ถูกต้องสำหรับส่งซ้ำ',
  redelivery_in_progress: 'กำลังดำเนินการส่งหรือส่งซ้ำสำหรับเหตุการณ์เว็บฮุกนี้อยู่แล้ว',
};

export default Object.freeze(hook);
