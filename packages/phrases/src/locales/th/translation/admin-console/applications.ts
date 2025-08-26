const applications = {
  page_title: 'แอปพลิเคชัน',
  title: 'แอปพลิเคชัน',
  subtitle: 'สร้างและจัดการแอปพลิเคชันสำหรับการรับรองความถูกต้อง OIDC',
  subtitle_with_app_type: 'ตั้งค่าการยืนยันตัวตน Logto สำหรับแอปพลิเคชัน {{name}} ของคุณ',
  create: 'สร้างแอปพลิเคชัน',
  create_subtitle_third_party:
    'ใช้ Logto เป็นผู้ให้บริการระบุตัวตน (IdP) ของคุณเพื่อผสานรวมกับแอปพลิเคชันของบุคคลที่สามได้อย่างง่ายดาย',
  application_name: 'ชื่อแอปพลิเคชัน',
  application_name_placeholder: 'แอปของฉัน',
  application_description: 'คำอธิบายแอปพลิเคชัน',
  application_description_placeholder: 'กรอกคำอธิบายแอปพลิเคชันของคุณ',
  select_application_type: 'เลือกประเภทแอปพลิเคชัน',
  no_application_type_selected: 'คุณยังไม่ได้เลือกประเภทแอปพลิเคชัน',
  application_created: 'สร้างแอปพลิเคชันสำเร็จแล้ว',
  tab: {
    my_applications: 'แอปของฉัน',
    third_party_applications: 'แอปของบุคคลที่สาม',
  },
  app_id: 'App ID',
  type: {
    native: {
      title: 'แอปเนทีฟ',
      subtitle: 'แอปที่ทำงานในสภาพแวดล้อมเนทีฟ',
      description: 'เช่น แอป iOS , แอป Android',
    },
    spa: {
      title: 'แอปหน้าเดียว',
      subtitle: 'แอปที่ทำงานในเว็บเบราว์เซอร์และอัปเดตข้อมูลแบบไดนามิก',
      description: 'เช่น แอป React DOM , แอป Vue',
    },
    traditional: {
      title: 'เว็บไซต์ดั้งเดิม',
      subtitle: 'แอปที่เรนเดอร์และอัปเดตหน้าโดยเว็บเซิร์ฟเวอร์เท่านั้น',
      description: 'เช่น Next.js , PHP',
    },
    machine_to_machine: {
      title: 'เครื่องสู่เครื่อง',
      subtitle: 'แอป (โดยปกติเป็นบริการ) ที่เชื่อมต่อกับทรัพยากรโดยตรง',
      description: 'เช่น บริการฝั่งเซิร์ฟเวอร์',
    },
    protected: {
      title: 'แอปที่ถูกป้องกัน',
      subtitle: 'แอปที่ได้รับการป้องกันโดย Logto', // Not in use
      description: 'ไม่มีข้อมูล', // Not in use
    },
    saml: {
      title: 'แอป SAML',
      subtitle: 'แอปที่ใช้เป็นตัวเชื่อมต่อ SAML IdP',
      description: 'เช่น SAML',
    },
    third_party: {
      title: 'แอปของบุคคลที่สาม',
      subtitle: 'แอปที่ใช้เป็นตัวเชื่อมต่อ IdP ของบุคคลที่สาม',
      description: 'เช่น OIDC',
    },
  },
  placeholder_title: 'เลือกประเภทแอปพลิเคชันเพื่อดำเนินการต่อ',
  placeholder_description:
    'Logto ใช้เอนทิตีแอปพลิเคชันสำหรับ OIDC เพื่อช่วยในงานต่าง ๆ เช่น การระบุแอป การจัดการการเข้าสู่ระบบ และสร้างบันทึกการตรวจสอบ',
};

export default Object.freeze(applications);
