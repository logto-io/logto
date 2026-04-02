const oss_onboarding = {
  page_title: 'เริ่มต้นใช้งาน',
  title: 'บอกเราเกี่ยวกับคุณสักเล็กน้อย',
  description:
    'บอกเราเกี่ยวกับตัวคุณและโปรเจกต์ของคุณสักเล็กน้อย เพื่อช่วยให้เราสร้าง Logto ที่ดีขึ้นสำหรับทุกคน',
  email: {
    label: 'อีเมล',
    description: 'เราจะใช้อีเมลนี้หากจำเป็นต้องติดต่อคุณเกี่ยวกับบัญชีของคุณ',
    placeholder: 'email@example.com',
  },
  newsletter: 'รับอัปเดตผลิตภัณฑ์ คำแนะนำด้านความปลอดภัย และเนื้อหาคัดสรรจาก Logto',
  project: {
    label: 'ฉันใช้ Logto สำหรับ',
    personal: 'โปรเจกต์ส่วนตัว',
    company: 'โปรเจกต์ของบริษัท',
  },
  company_name: {
    label: 'ชื่อบริษัท',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'บริษัทของคุณมีขนาดเท่าไร?',
  },
  errors: {
    email_required: 'จำเป็นต้องกรอกอีเมล',
    email_invalid: 'กรุณากรอกอีเมลที่ถูกต้อง',
    company_name_required: 'จำเป็นต้องกรอกชื่อบริษัท',
    company_size_required: 'จำเป็นต้องเลือกขนาดบริษัท',
  },
};

export default Object.freeze(oss_onboarding);
