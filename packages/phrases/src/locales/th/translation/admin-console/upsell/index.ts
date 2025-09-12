import add_on from './add-on.js';
import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'อัปเกรดแผน',
  compare_plans: 'เปรียบเทียบแผน',
  view_plans: 'ดูแผน',
  create_tenant: {
    title: 'เลือกแผนสำหรับผู้เช่า',
    description:
      'Logto มีตัวเลือกแผนราคาที่แข่งขันได้ พร้อมราคานวัตกรรมและเข้าถึงง่าย เหมาะกับบริษัทที่กำลังเติบโต <a>เรียนรู้เพิ่มเติม</a>',
    base_price: 'ราคาเริ่มต้น',
    monthly_price: '{{value, number}}/เดือน',
    view_all_features: 'ดูฟีเจอร์ทั้งหมด',
    select_plan: 'เลือก <name/>',
    free_tenants_limit: 'สูงสุด {{count, number}} ผู้เช่าใช้ฟรี',
    free_tenants_limit_other: 'สูงสุด {{count, number}} ผู้เช่าใช้ฟรี',
    most_popular: 'ยอดนิยมที่สุด',
    upgrade_success: 'อัปเกรดเป็น <name/> สำเร็จ',
  },
  mau_exceeded_modal: {
    title: 'MAU เกินขีดจำกัด กรุณาอัปเกรดแผนของคุณ',
    notification:
      'MAU ปัจจุบันของคุณเกินขีดจำกัดของ <planName/> โปรดอัปเกรดเป็นแผนพรีเมียมโดยเร็วเพื่อป้องกันการระงับบริการ Logto ',
    update_plan: 'อัปเดตแผน',
  },
  token_exceeded_modal: {
    title: 'การใช้โทเคนเกินขีดจำกัด กรุณาอัปเกรดแผนของคุณ',
    notification:
      'คุณใช้โทเคนของ <planName/> เกินขีดจำกัด ผู้ใช้งานจะไม่สามารถเข้าถึงบริการ Logto ได้ตามปกติ โปรดอัปเกรดเป็นแผนพรีเมียมโดยเร็วเพื่อหลีกเลี่ยงปัญหา',
  },
  payment_overdue_modal: {
    title: 'การชำระบิลล่าช้า',
    notification:
      'ขออภัย! การชำระบิลของผู้เช่า <span>{{name}}</span> ล้มเหลว กรุณาชำระบิลนี้โดยเร็วเพื่อป้องกันการระงับบริการ Logto',
    unpaid_bills: 'บิลที่ยังไม่ได้ชำระ',
    update_payment: 'อัปเดตการชำระเงิน',
  },
  add_on_quota_item: {
    api_resource: 'API resource',
    machine_to_machine: 'แอปพลิเคชัน machine-to-machine',
    tokens: '{{limit}}M โทเคน',
    tenant_member: 'สมาชิกผู้เช่า',
  },
  charge_notification_for_quota_limit:
    'คุณใช้เกินโควต้าของ {{item}} แล้ว Logto จะคิดค่าบริการที่ใช้เกินจากโควต้าของคุณ คิดค่าบริการจากวันที่เริ่มใช้โมเดลราคา add-on ใหม่ <a>เรียนรู้เพิ่มเติม</a>',
  paywall,
  featured_plan_content,
  add_on,
  convert_to_production_modal: {
    title: 'คุณกำลังจะเปลี่ยนผู้เช่าแบบ development เป็น production',
    description:
      'พร้อมใช้งานจริงหรือยัง? การแปลงผู้เช่าทดลองนี้เป็นผู้เช่า production จะปลดล็อกฟังก์ชั่นการใช้งานเต็มรูปแบบ',
    benefits: {
      stable_environment: 'สำหรับผู้ใช้งาน: สภาพแวดล้อมที่เสถียรสำหรับการใช้งานจริง',
      keep_pro_features: 'คงฟีเจอร์ Pro: คุณจะสมัครแผน Pro <a>ดูฟีเจอร์ Pro</a>',
      no_dev_restrictions:
        'ไม่มีข้อจำกัด dev: ยกเลิกขีดจำกัดระบบ entity/resource และแบนเนอร์ sign-in',
    },
    cards: {
      dev_description: 'เพื่อการทดสอบ',
      prod_description: 'ใช้งานจริง',
      convert_label: 'แปลง',
    },
    button: 'เปลี่ยนเป็นผู้เช่า production',
  },
};

export default Object.freeze(upsell);
