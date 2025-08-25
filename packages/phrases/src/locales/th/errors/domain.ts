const domain = {
  not_configured: 'ยังไม่ได้กำหนดผู้ให้บริการชื่อโดเมน',
  cloudflare_data_missing: 'ขาดข้อมูล cloudflare_data โปรดตรวจสอบ',
  cloudflare_unknown_error: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุขณะร้องขอ API ของ Cloudflare',
  cloudflare_response_error: 'ได้รับการตอบกลับที่ไม่คาดคิดจาก Cloudflare',
  limit_to_one_domain: 'คุณสามารถมีโดเมนแบบกำหนดเองได้เพียงหนึ่งโดเมนเท่านั้น',
  hostname_already_exists: 'โดเมนนี้มีอยู่บนเซิร์ฟเวอร์ของเราแล้ว',
  cloudflare_not_found: 'ไม่พบชื่อโฮสต์ใน Cloudflare',
  domain_is_not_allowed: 'ไม่อนุญาตให้ใช้โดเมนนี้',
};

export default Object.freeze(domain);
