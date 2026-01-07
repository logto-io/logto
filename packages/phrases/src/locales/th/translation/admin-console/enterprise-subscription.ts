const enterprise_subscription = {
  page_title: 'การสมัครสมาชิก',
  title: 'จัดการการสมัครสมาชิกของคุณ',
  subtitle: 'นี่คือที่สำหรับจัดการการสมัครสมาชิกแบบหลายผู้เช่าและประวัติการเรียกเก็บเงินของคุณ',
  tab: {
    subscription: 'การสมัครสมาชิก',
    billing_history: 'ประวัติการเรียกเก็บเงิน',
  },
  subscription: {
    title: 'การสมัครสมาชิก',
    description:
      'ติดตามการใช้งานของคุณได้อย่างง่ายดาย ดูใบเรียกเก็บเงินถัดไปของคุณ และตรวจสอบสัญญาเดิมของคุณ',
    enterprise_plan_title: 'แผนองค์กร',
    enterprise_plan_description:
      'นี่คือการสมัครสมาชิกแผนองค์กรของคุณ และโควตานี้ถูกแชร์ข้ามผู้เช่า การใช้งานอาจมีความล่าช้าเล็กน้อยในการอัปเดต',
    add_on_title: 'จ่ายตามการใช้งานเสริม',
    add_on_description:
      'เหล่านี้คือการใช้งานเสริมแบบจ่ายตามการใช้งานตามสัญญาของคุณหรืออัตรามาตรฐานแบบจ่ายตามการใช้งานของ Logto จะถูกเรียกเก็บเงินตามการใช้งานจริงของคุณ',
    included: 'ถูกรวมไว้',
    over_quota: 'เกินโควตา',
    basic_plan_column_title: {
      product: 'ผลิตภัณฑ์',
      usage: 'การใช้งาน',
      quota: 'โควตา',
    },
    add_on_column_title: {
      product: 'ผลิตภัณฑ์',
      unit_price: 'ราคาต่อหน่วย',
      quantity: 'ปริมาณ',
      total_price: 'ทั้งหมด',
    },
    add_on_sku_price: '${{price}}/เดือน',
    private_region_title: 'อินสแตนซ์คลาวด์ส่วนตัว ({{regionName}})',
    shared_cross_tenants: 'ข้ามผู้เช่า',
  },
};

export default Object.freeze(enterprise_subscription);
