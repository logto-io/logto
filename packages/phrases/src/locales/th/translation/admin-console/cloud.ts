const cloud = {
  general: {
    onboarding: 'เริ่มต้นใช้งาน',
  },
  create_tenant: {
    page_title: 'สร้าง Tenants',
    title: 'สร้าง Tenants แรกของคุณ',
    description:
      'Tenant คือสภาพแวดล้อมที่แยกออกจากกันซึ่งคุณสามารถจัดการข้อมูลตัวตนของผู้ใช้ แอปพลิเคชัน และทรัพยากรอื่น ๆ ของ Logto ได้ทั้งหมด',
    invite_collaborators: 'เชิญผู้ร่วมงานของคุณผ่านอีเมล',
  },
  social_callback: {
    title: 'คุณลงชื่อเข้าใช้สำเร็จแล้ว',
    description:
      'คุณได้ลงชื่อเข้าใช้ด้วยบัญชีโซเชียลของคุณเรียบร้อยแล้ว เพื่อการใช้งาน Logto อย่างเต็มประสิทธิภาพและต่อเนื่อง แนะนำให้คุณตั้งค่าตัวเชื่อมต่อโซเชียลของคุณเอง',
    notice:
      'กรุณาหลีกเลี่ยงการใช้ demo connector ในการใช้งานจริง หลังจากทดสอบเสร็จแล้วให้ลบ demo connector และตั้งค่าตัวเชื่อมต่อของคุณเองด้วยข้อมูลรับรองของคุณ',
  },
  tenant: {
    create_tenant: 'สร้าง Tenants',
  },
};

export default Object.freeze(cloud);
