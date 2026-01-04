const enterprise_subscription = {
  page_title: 'การสมัครสมาชิก',
  title: 'จัดการการสมัครสมาชิกของคุณ',
  subtitle: 'ดูและจัดการรายละเอียดการสมัครสมาชิกแบบหลายผู้เช่าและข้อมูลการเรียกเก็บเงินของคุณ',
  tab: {
    subscription: 'การสมัครสมาชิก',
    billing_history: 'ประวัติการเรียกเก็บเงิน',
  },
  subscription: {
    title: 'การสมัครสมาชิก',
    description: 'ตรวจสอบรายละเอียดการใช้งานแผนสมัครสมาชิกปัจจุบันและข้อมูลการเรียกเก็บเงินของคุณ',
    enterprise_plan_title: 'แผนองค์กร',
    enterprise_plan_description:
      'นี่คือการสมัครสมาชิกแผนองค์กรของคุณ ซึ่งโควตานี้ใช้ร่วมกันระหว่างผู้เช่าทั้งหมดภายใต้การสมัครสมาชิกองค์กรของคุณ',
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
