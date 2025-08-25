const security = {
  page_title: 'การรักษาความปลอดภัย',
  title: 'การรักษาความปลอดภัย',
  subtitle: 'กำหนดค่าการป้องกันขั้นสูงต่อการโจมตีที่ซับซ้อน',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'นโยบายรหัสผ่าน',
    blocklist: 'บัญชีดำ',
    general: 'ทั่วไป',
  },
  bot_protection: {
    title: 'การป้องกันบอท',
    description:
      'เปิดใช้งาน CAPTCHA สำหรับการสมัครสมาชิก การเข้าสู่ระบบ และการกู้คืนรหัสผ่าน เพื่อป้องกันภัยคุกคามอัตโนมัติ',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'เลือกผู้ให้บริการ CAPTCHA และตั้งค่าการใช้งาน',
      add: 'เพิ่ม CAPTCHA',
    },
    settings: 'การตั้งค่า',
    enable_captcha: 'เปิดใช้งาน CAPTCHA',
    enable_captcha_description:
      'เปิดใช้งานการตรวจสอบ CAPTCHA สำหรับขั้นตอนการสมัครสมาชิก การเข้าสู่ระบบ และการกู้คืนรหัสผ่าน',
  },
  create_captcha: {
    setup_captcha: 'ตั้งค่า CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'โซลูชั่น CAPTCHA ระดับองค์กรของ Google ที่มีการตรวจจับภัยคุกคามขั้นสูงและวิเคราะห์ข้อมูลความปลอดภัยอย่างละเอียด เพื่อปกป้องเว็บไซต์ของคุณจากกิจกรรมทุจริต',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'ทางเลือก CAPTCHA อัจฉริยะจาก Cloudflare ที่ป้องกันบอทโดยไม่ก่อให้เกิดอุปสรรคต่อผู้ใช้และไม่มีปริศนาภาพ',
    },
  },
  captcha_details: {
    back_to_security: 'กลับไปที่การรักษาความปลอดภัย',
    page_title: 'รายละเอียด CAPTCHA',
    check_readme: 'ตรวจสอบ README',
    options_change_captcha: 'เปลี่ยนผู้ให้บริการ CAPTCHA',
    connection: 'การเชื่อมต่อ',
    description: 'กำหนดค่าการเชื่อมต่อ CAPTCHA ของคุณ',
    site_key: 'Site key',
    secret_key: 'Secret key',
    project_id: 'Project ID',
    recaptcha_key_id: 'reCAPTCHA key ID',
    recaptcha_api_key: 'API key ของโปรเจกต์',
    deletion_description: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ให้บริการ CAPTCHA นี้?',
    captcha_deleted: 'ลบผู้ให้บริการ CAPTCHA เรียบร้อยแล้ว',
    setup_captcha: 'ตั้งค่า CAPTCHA',
  },
  password_policy: {
    password_requirements: 'ข้อกำหนดรหัสผ่าน',
    password_requirements_description:
      'เพิ่มความแข็งแกร่งของรหัสผ่านเพื่อป้องกันการโจมตีด้วยข้อมูลประจำตัวหรือรหัสผ่านที่อ่อนแอ',
    minimum_length: 'ความยาวขั้นต่ำ',
    minimum_length_description: 'NIST แนะนำให้ใช้ <a>อย่างน้อย 8 ตัวอักษร</a> สำหรับผลิตภัณฑ์เว็บ',
    minimum_length_error: 'ความยาวขั้นต่ำต้องอยู่ระหว่าง {{min}} ถึง {{max}} (รวมทั้งสองค่านี้)',
    minimum_required_char_types: 'ประเภทอักขระขั้นต่ำที่ต้องมี',
    minimum_required_char_types_description:
      'ประเภทอักขระ: ตัวพิมพ์ใหญ่ (A-Z), ตัวพิมพ์เล็ก (a-z), ตัวเลข (0-9) และสัญลักษณ์พิเศษ ({{symbols}})',
    password_rejection: 'การปฏิเสธรหัสผ่าน',
    compromised_passwords: 'ปฏิเสธรหัสผ่านที่ถูกละเมิด',
    breached_passwords: 'รหัสผ่านที่รั่วไหล',
    breached_passwords_description: 'ปฏิเสธรหัสผ่านที่พบในฐานข้อมูลรหัสผ่านที่รั่วไหล',
    restricted_phrases: 'จำกัดวลีที่มีความปลอดภัยต่ำ',
    restricted_phrases_tooltip:
      'รหัสผ่านของคุณไม่ควรมีวลีเหล่านี้ ยกเว้นคุณจะเพิ่มอักขระอีก 3 ตัวหรือมากกว่าเพิ่มเข้าไป',
    repetitive_or_sequential_characters: 'อักขระซ้ำหรือเรียงต่อกัน',
    repetitive_or_sequential_characters_description: 'เช่น "AAAA", "1234" และ "abcd"',
    user_information: 'ข้อมูลผู้ใช้',
    user_information_description: 'เช่น อีเมล เบอร์โทรศัพท์ ชื่อผู้ใช้ ฯลฯ',
    custom_words: 'คำกำหนดเอง',
    custom_words_description:
      'กำหนดคำที่เฉพาะเจาะจงกับบริบท ไม่สนใจตัวพิมพ์ใหญ่หรือเล็ก ใส่หนึ่งรายการต่อบรรทัด',
    custom_words_placeholder: 'ชื่อบริการของคุณ ชื่อบริษัท ฯลฯ',
  },
  sentinel_policy: {
    card_title: 'ล็อกเอาต์ตามตัวระบุ',
    card_description:
      'ระบบล็อกเอาต์ใช้ได้กับผู้ใช้ทุกคนโดยตั้งค่าเริ่มต้น แต่คุณสามารถกำหนดเองได้เพื่อควบคุมมากขึ้น\n\nล็อกตัวระบุชั่วคราวหลังจากป้อนข้อมูลรับรองผิดหลายครั้ง (เช่น รหัสผ่านหรือรหัสยืนยันผิดติดต่อกัน) เพื่อป้องกันการเข้าถึงด้วยวิธี brute force',
    enable_sentinel_policy: {
      title: 'กำหนดประสบการณ์ล็อกเอาต์เอง',
      description:
        'กำหนดจำนวนครั้งสูงสุดที่พยายามเข้าสู่ระบบผิดก่อนถูกล็อก ระยะเวลาการล็อก และปลดล็อกทันทีได้เอง',
    },
    max_attempts: {
      title: 'จำนวนครั้งสูงสุดที่ผิดพลาด',
      description: 'ล็อกตัวระบุชั่วคราวเมื่อถึงจำนวนครั้งสูงสุดที่เข้าสู่ระบบผิดภายใน 1 ชั่วโมง',
      error_message: 'จำนวนครั้งต้องมากกว่า 0',
    },
    lockout_duration: {
      title: 'ระยะเวลาล็อกเอาต์ (นาที)',
      description: 'บล็อกการเข้าสู่ระบบช่วงเวลาหนึ่ง หลังจากเกินจำนวนครั้งที่เข้าสู่ระบบผิดกำหนด',
      error_message: 'ระยะเวลาล็อกเอาต์ต้องไม่น้อยกว่า 1 นาที',
    },
    manual_unlock: {
      title: 'ปลดล็อกด้วยตนเอง',
      description: 'ปลดล็อกผู้ใช้ทันทีโดยยืนยันตัวตนและป้อนตัวระบุของพวกเขา',
      unblock_by_identifiers: 'ปลดล็อกด้วยตัวระบุ',
      modal_description_1:
        'ตัวระบุถูกล็อกชั่วคราวเนื่องจากพยายามเข้าสู่ระบบ/สมัครใช้บริการผิดหลายครั้ง เพื่อความปลอดภัย ระบบจะคืนสิทธิ์เข้าถึงโดยอัตโนมัติหลังหมดระยะเวลาล็อก',
      modal_description_2:
        ' ปลดล็อกด้วยตนเองต่อเมื่อคุณได้ยืนยันตัวตนของผู้ใช้และแน่ใจว่าไม่มีการพยายามเข้าถึงโดยไม่ได้รับอนุญาต',
      placeholder: 'ป้อนตัวระบุ (อีเมล / เบอร์โทรศัพท์ / ชื่อผู้ใช้)',
      confirm_button_text: 'ปลดล็อกตอนนี้',
      success_toast: 'ปลดล็อกสำเร็จ',
      duplicate_identifier_error: 'เพิ่มตัวระบุซ้ำแล้ว',
      empty_identifier_error: 'โปรดป้อนอย่างน้อยหนึ่งตัวระบุ',
    },
  },
  blocklist: {
    card_title: 'บัญชีดำอีเมล',
    card_description: 'ควบคุมผู้ใช้ของคุณโดยบล็อกอีเมลที่มีความเสี่ยงสูงหรือไม่ต้องการ',
    disposable_email: {
      title: 'บล็อกอีเมลชั่วคราว (disposable email)',
      description:
        'เปิดใช้งานเพื่อปฏิเสธการลงทะเบียนด้วยอีเมลชั่วคราวหรืออีเมลขยะ เพื่อป้องกันสแปมและยกระดับคุณภาพผู้ใช้',
    },
    email_subaddressing: {
      title: 'บล็อกอีเมลซับแอดเดรส',
      description:
        'เปิดใช้งานเพื่อปฏิเสธการลงทะเบียนที่ใช้อีเมลพร้อมเครื่องหมายบวก (+) และอักขระเพิ่มเติม (เช่น user+alias@foo.com)',
    },
    custom_email_address: {
      title: 'บล็อกอีเมลกำหนดเอง',
      description: 'เพิ่มโดเมนหรืออีเมลที่เฉพาะเจาะจงที่ไม่สามารถลงทะเบียนหรือลิงก์ผ่าน UI ได้',
      placeholder: 'ป้อนอีเมลหรือโดเมนที่ต้องการบล็อก (เช่น bar@example.com, @example.com)',
      duplicate_error: 'เพิ่มอีเมลหรือโดเมนนี้แล้ว',
      invalid_format_error: 'ต้องเป็นอีเมล(bar@example.com) หรือโดเมน(@example.com) ที่ถูกต้อง',
    },
  },
};

export default Object.freeze(security);
