const content = {
  terms_of_use: {
    title: 'ข้อกำหนด',
    description: 'เพิ่มข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวเพื่อให้เป็นไปตามข้อบังคับ',
    terms_of_use: 'URL ข้อกำหนดการใช้งาน',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'URL นโยบายความเป็นส่วนตัว',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'ยอมรับข้อกำหนด',
    agree_policies: {
      automatic: 'ดำเนินการต่อเพื่อยอมรับข้อกำหนดโดยอัตโนมัติ',
      manual_registration_only: 'ต้องติ๊กถูกยอมรับเฉพาะตอนลงทะเบียน',
      manual: 'ต้องติ๊กถูกยอมรับทั้งตอนลงทะเบียนและเข้าสู่ระบบ',
    },
  },
  languages: {
    title: 'ภาษา',
    enable_auto_detect: 'เปิดใช้งานการตรวจจับอัตโนมัติ',
    description:
      'ซอฟต์แวร์ของคุณจะตรวจจับการตั้งค่าภาษาของผู้ใช้และเปลี่ยนเป็นภาษาท้องถิ่น คุณสามารถเพิ่มภาษาใหม่ได้โดยการแปล UI จากภาษาอังกฤษเป็นภาษาอื่น',
    manage_language: 'จัดการภาษา',
    default_language: 'ภาษาหลัก',
    default_language_description_auto:
      'ภาษาหลักจะถูกใช้เมื่อภาษาที่ตรวจพบของผู้ใช้ไม่ถูกรองรับในไลบรารีภาษาในปัจจุบัน',
    default_language_description_fixed:
      'เมื่อการตรวจจับอัตโนมัติถูกปิด ภาษาหลักจะเป็นภาษาหลักเดียวที่ซอฟต์แวร์ของคุณจะแสดง เปิดใช้งานการตรวจจับอัตโนมัติเพื่อขยายภาษา',
  },
  support: {
    title: 'การสนับสนุน',
    subtitle: 'แสดงช่องทางการสนับสนุนของคุณบนหน้าข้อผิดพลาดเพื่อช่วยผู้ใช้งานอย่างรวดเร็ว',
    support_email: 'อีเมลสนับสนุน',
    support_email_placeholder: 'support@email.com',
    support_website: 'เว็บไซต์สนับสนุน',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'จัดการภาษา',
    subtitle:
      'ปรับแต่งประสบการณ์การใช้งานผลิตภัณฑ์โดยเพิ่มภาษาและการแปล การมีส่วนร่วมของคุณสามารถตั้งเป็นภาษาหลักได้',
    add_language: 'เพิ่มภาษา',
    logto_provided: 'ที่ Logto ให้มา',
    key: 'คีย์',
    logto_source_values: 'ค่าต้นทางจาก Logto',
    custom_values: 'ค่ากำหนดเอง',
    clear_all_tip: 'ล้างค่าทั้งหมด',
    unsaved_description: 'การเปลี่ยนแปลงจะไม่ถูกบันทึกหากคุณออกจากหน้านี้โดยไม่บันทึก',
    deletion_tip: 'ลบภาษา',
    deletion_title: 'คุณต้องการลบภาษาที่เพิ่มไว้หรือไม่?',
    deletion_description: 'หลังจากลบแล้ว ผู้ใช้ของคุณจะไม่สามารถเข้าชมในภาษานั้นได้อีก',
    default_language_deletion_title: 'ไม่สามารถลบภาษาหลักได้',
    default_language_deletion_description:
      '{{language}} ถูกตั้งเป็นภาษาหลักของคุณและไม่สามารถลบได้',
  },
};

export default Object.freeze(content);
