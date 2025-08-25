const domain = {
  status: {
    connecting: 'กำลังเชื่อมต่อ...',
    in_use: 'กำลังใช้งาน',
    failed_to_connect: 'เชื่อมต่อไม่สำเร็จ',
  },
  update_endpoint_notice:
    'อย่าลืมอัปเดตโดเมนสำหรับ Social connector callback URI และ Logto endpoint ในแอปพลิเคชันของคุณ หากต้องการใช้โดเมนที่กำหนดเองสำหรับฟีเจอร์เหล่านี้',
  error_hint: 'โปรดตรวจสอบว่าคุณได้อัปเดตเรคคอร์ด DNS แล้ว เราจะตรวจสอบต่อไปทุก ๆ {{value}} วินาที',
  custom: {
    custom_domain: 'โดเมนที่กำหนดเอง',
    custom_domain_description:
      'เพิ่มความโดดเด่นให้กับแบรนด์ของคุณด้วยการใช้โดเมนที่กำหนดเอง โดเมนนี้จะถูกนำมาใช้ในประสบการณ์ลงชื่อเข้าใช้งานของคุณ',
    custom_domain_field: 'โดเมนที่กำหนดเอง',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'เพิ่มโดเมน',
    invalid_domain_format:
      'โปรดระบุ URL โดเมนที่ถูกต้องและประกอบด้วยอย่างน้อย 3 ส่วน เช่น "your.domain.com."',
    verify_domain: 'ยืนยันโดเมน',
    enable_ssl: 'เปิดใช้ SSL',
    checking_dns_tip:
      'หลังจากคุณตั้งค่าเรคคอร์ด DNS แล้ว ขั้นตอนจะเริ่มอัตโนมัติและอาจใช้เวลาไม่เกิน 24 ชั่วโมง คุณสามารถออกจากหน้านี้ได้ในขณะที่ดำเนินการ',
    enable_ssl_tip:
      'การเปิดใช้ SSL จะเริ่มโดยอัตโนมัติและอาจใช้เวลาไม่เกิน 24 ชั่วโมง คุณสามารถออกจากหน้านี้ได้ในขณะที่ดำเนินการ',
    generating_dns_records: 'กำลังสร้างเรคคอร์ด DNS...',
    add_dns_records: 'กรุณาเพิ่มเรคคอร์ด DNS เหล่านี้กับผู้ให้บริการ DNS ของคุณ',
    dns_table: {
      type_field: 'ประเภท',
      name_field: 'ชื่อ',
      value_field: 'ค่า',
    },
    deletion: {
      delete_domain: 'ลบโดเมน',
      reminder: 'ลบโดเมนที่กำหนดเอง',
      description: 'คุณแน่ใจหรือว่าต้องการลบโดเมนที่กำหนดเองนี้?',
      in_used_description:
        'คุณแน่ใจหรือว่าต้องการลบโดเมนที่กำหนดเอง "<span>{{domain}}</span>" นี้?',
      in_used_tip:
        'หากคุณได้ตั้งค่าโดเมนที่กำหนดเองนี้ในผู้ให้บริการ social connector หรือแอปพลิเคชัน endpoint ก่อนหน้านี้ คุณจะต้องแก้ไข URI ให้เป็นโดเมน Logto ค่าเริ่มต้น "<span>{{domain}}</span>" ก่อน เพื่อให้ปุ่มลงชื่อเข้าใช้งานโซเชียลทำงานได้ถูกต้อง',
      deleted: 'ลบโดเมนที่กำหนดเองสำเร็จ!',
    },
  },
  default: {
    default_domain: 'โดเมนเริ่มต้น',
    default_domain_description:
      'Logto มีโดเมนเริ่มต้นที่ได้รับการกำหนดค่าไว้ล่วงหน้า พร้อมใช้งานโดยไม่ต้องตั้งค่าเพิ่มเติม โดเมนเริ่มต้นนี้จะใช้เป็นทางเลือกสำรอง แม้ว่าคุณจะเปิดใช้โดเมนที่กำหนดเองแล้วก็ตาม',
    default_domain_field: 'โดเมน Logto เริ่มต้น',
  },
  custom_endpoint_note:
    'คุณสามารถปรับแต่งชื่อโดเมนของ endpoint เหล่านี้ตามที่คุณต้องการ เลือก "{{custom}}" หรือ "{{default}}"',
  custom_social_callback_url_note:
    'คุณสามารถปรับแต่งชื่อโดเมนของ URI นี้ให้ตรงกับ endpoint ของแอปพลิเคชันของคุณ เลือก "{{custom}}" หรือ "{{default}}"',
  custom_acs_url_note:
    'คุณสามารถปรับแต่งชื่อโดเมนของ URI นี้ให้ตรงกับ URL assertion consumer service ของผู้ให้บริการตัวตนของคุณ เลือก "{{custom}}" หรือ "{{default}}"',
};

export default Object.freeze(domain);
