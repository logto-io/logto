const protected_app = {
  name: 'แอปที่ได้รับการปกป้อง',
  title: 'สร้างแอปที่ได้รับการปกป้อง: เพิ่มระบบยืนยันตัวตนได้อย่างง่ายและรวดเร็ว',
  fast_create: 'สร้างอย่างรวดเร็ว',
  modal_title: 'สร้างแอปที่ได้รับการปกป้อง',
  modal_subtitle:
    'เปิดการปกป้องที่ปลอดภัยและรวดเร็วได้เพียงไม่กี่คลิก เพิ่มระบบยืนยันตัวตนให้แอปเว็บของคุณได้อย่างง่ายดาย',
  form: {
    url_field_label: 'URL แหล่งต้นทางของคุณ',
    url_field_placeholder: 'https://domain.com/',
    url_field_description: 'กรุณาใส่ที่อยู่ของแอปที่ต้องการระบบยืนยันตัวตน',
    url_field_modification_notice:
      'การแก้ไข URL ต้นทางอาจใช้เวลาสูงสุด 1-2 นาทีจึงจะมีผลในทุกเซิร์ฟเวอร์ทั่วโลก',
    url_field_tooltip:
      "กรุณาระบุที่อยู่ของแอปของคุณโดยไม่ต้องใส่ '/pathname' หลังจากสร้างแล้ว คุณสามารถกำหนดกฎการยืนยันตัวตนของเส้นทางได้เอง\n\n หมายเหตุ: URL ต้นทางไม่จำเป็นต้องยืนยันตัวตน แต่อุปกรณ์ปกป้องจะมีผลเฉพาะการเข้าถึงผ่านโดเมนแอปที่กำหนดเท่านั้น",
    domain_field_label: 'โดเมนของแอป',
    domain_field_placeholder: 'your-domain',
    domain_field_description:
      'ลิงก์นี้จะเป็นพร็อกซีสำหรับปกป้องระบบยืนยันตัวตนให้ URL ต้นทาง คุณสามารถเพิ่มโดเมนที่ต้องการหลังจากสร้างเสร็จ',
    domain_field_description_short:
      'ลิงก์นี้จะเป็นพร็อกซีสำหรับปกป้องระบบยืนยันตัวตนให้ URL ต้นทาง',
    domain_field_tooltip:
      "แอปที่ได้รับการปกป้องด้วย Logto จะถูกโฮสต์ที่ 'your-domain.{{domain}}' โดยอัตโนมัติ คุณสามารถเพิ่มโดเมนเองได้หลังจากนี้",
    create_application: 'สร้างแอปพลิเคชัน',
    create_protected_app: 'สร้างอย่างรวดเร็ว',
    errors: {
      domain_required: 'กรุณาระบุโดเมนของคุณ',
      domain_in_use: 'ชื่อซับโดเมนนี้ถูกใช้แล้ว',
      invalid_domain_format:
        "รูปแบบซับโดเมนไม่ถูกต้อง: ใช้แค่ตัวอักษรพิมพ์เล็ก ตัวเลข และขีดกลาง '-' เท่านั้น",
      url_required: 'กรุณาระบุ URL ต้นทาง',
      invalid_url:
        "รูปแบบ URL ต้นทางไม่ถูกต้อง: กรุณาใช้ http:// หรือ https:// หมายเหตุ: '/pathname' ยังไม่รองรับในขณะนี้",
      localhost:
        'กรุณาเปิดเผยเซิร์ฟเวอร์ local ของคุณสู่ภายนอกก่อน ดูข้อมูลเพิ่มเติมเกี่ยวกับ <a>การพัฒนาแบบ local</a>',
    },
  },
  id_token_claims: {
    card_title: 'Claims ของ ID token',
    card_description:
      'ขอ user scope เพิ่มเติมในระหว่างการลงชื่อเข้าใช้แอปที่ได้รับการปกป้อง เพื่อรวม claims ที่ขยายและถูกเปิดใช้งานไว้ใน ID token ที่ถูกส่งต่อ',
    field_title: 'Scopes เพิ่มเติม',
    field_description:
      'Claims จะถูกรวมก็ต่อเมื่อถูกเปิดใช้งานใน <a>Custom JWT > ID token</a> และมีการขอ scope ที่ตรงกันที่นี่',
    table_column_scope: 'Scope',
    table_column_claims_forwarded: 'Claims ที่ส่งต่อ',
    disabled_claims_hint:
      'Claims ที่เป็นสีเทายังไม่ถูกส่งต่อ เปิดใช้งานใน <a>Custom JWT > ID token</a> เพื่อรวมไว้ใน ID token',
  },
  success_message: '🎉 เปิดใช้ระบบยืนยันตัวตนของแอปสำเร็จแล้ว! สนุกกับประสบการณ์ใหม่ของเว็บไซต์คุณ',
};

export default Object.freeze(protected_app);
