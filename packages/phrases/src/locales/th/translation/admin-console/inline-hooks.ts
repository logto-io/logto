const inline_hooks = {
  page_title: 'ฮุกแบบอินไลน์',
  title: 'ฮุกแบบอินไลน์',
  subtitle:
    'เรียกใช้โค้ดที่กำหนดเอง ณ จุดที่ระบุในขั้นตอนการยืนยันตัวตน เพื่อขยายการทำงานของ Logto',
  status: {
    not_configured: 'ยังไม่ได้กำหนดค่า',
    configured: 'กำหนดค่าแล้ว',
    enabled: 'เปิดใช้งาน',
    disabled: 'ปิดใช้งาน',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'หลังจากยืนยันปัจจัยแรก',
      description:
        'เรียกใช้ตรรกะที่กำหนดเองหลังจากยืนยันปัจจัยการยืนยันตัวตนแรกและก่อนดำเนินการเข้าสู่ระบบต่อ',
    },
    post_sign_in: {
      name: 'หลังจากเข้าสู่ระบบ',
      description: 'เรียกใช้ตรรกะที่กำหนดเองหลังจากผู้ใช้เข้าสู่ระบบสำเร็จ',
    },
  },
};

export default Object.freeze(inline_hooks);
