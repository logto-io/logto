import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: 'แผนฟรี',
  free_plan_description: 'สำหรับโปรเจกต์ขนาดเล็กและทดลองใช้ Logto เบื้องต้น ไม่ต้องใช้บัตรเครดิต',
  pro_plan: 'แผน Pro',
  pro_plan_description: 'เหมาะสำหรับธุรกิจที่ต้องการใช้งาน Logto อย่างไร้กังวล',
  enterprise: 'แผนองค์กร',
  enterprise_description: 'สำหรับทีมและธุรกิจขนาดใหญ่ที่ต้องการฟีเจอร์มาตรฐานองค์กร',
  admin_plan: 'แผนผู้ดูแลระบบ',
  dev_plan: 'แผนพัฒนา',
  current_plan: 'แผนปัจจุบัน',
  current_plan_description:
    'นี่คือแผนปัจจุบันของคุณ คุณสามารถตรวจสอบการใช้งานแผน ดูบิลถัดไป และเปลี่ยนแผนได้ตามที่ต้องการ',
  plan_usage: 'การใช้งานแผน',
  plan_cycle: 'รอบแผน: {{period}} การใช้งานจะเริ่มรอบใหม่ในวันที่ {{renewDate}}',
  next_bill: 'บิลถัดไปของคุณ',
  next_bill_hint: 'หากต้องการทราบรายละเอียดเพิ่มเติมเกี่ยวกับการคำนวณ โปรดอ่าน <a>บทความนี้</a>',
  next_bill_tip:
    'ราคาที่แสดงนี้ไม่รวมภาษี และอาจมีความล่าช้าในการอัปเดตเล็กน้อย จำนวนภาษีจะถูกคำนวณตามข้อมูลที่คุณให้และตามข้อกำหนดของกฎหมายท้องถิ่น และจะแสดงในใบแจ้งหนี้ของคุณ',
  manage_payment: 'จัดการการชำระเงิน',
  overfill_quota_warning: 'คุณใช้ถึงขีดจำกัดโควต้าแล้ว เพื่อป้องกันปัญหา โปรดอัปเกรดแผน',
  upgrade_pro: 'อัปเกรดเป็น Pro',
  update_payment: 'อัปเดตการชำระเงิน',
  payment_error:
    'พบปัญหาการชำระเงิน ไม่สามารถดำเนินการ ${{price, number}} สำหรับรอบที่แล้ว กรุณาอัปเดตการชำระเงินเพื่อหลีกเลี่ยงการระงับบริการ Logto',
  downgrade: 'ลดระดับ',
  current: 'ปัจจุบัน',
  upgrade: 'อัปเกรด',
  quota_table,
  billing_history: {
    invoice_column: 'ใบแจ้งหนี้',
    status_column: 'สถานะ',
    amount_column: 'จำนวน',
    invoice_created_date_column: 'วันที่ออกใบแจ้งหนี้',
    invoice_status: {
      void: 'ยกเลิกแล้ว',
      paid: 'ชำระแล้ว',
      open: 'เปิด',
      uncollectible: 'ค้างชำระ',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'คุณแน่ใจหรือว่าต้องการลดระดับ?',
    description:
      'หากคุณเลือกเปลี่ยนไปใช้ <targetName/> โปรดทราบว่าคุณจะไม่สามารถเข้าถึงโควต้าและฟีเจอร์เดิมใน <currentName/> ได้อีกต่อไป',
    before: 'ก่อนหน้า: <name/>',
    after: 'หลังจากเปลี่ยน: <name />',
    downgrade: 'ลดระดับ',
  },
  not_eligible_modal: {
    downgrade_title: 'คุณไม่สามารถลดระดับได้',
    downgrade_description:
      'โปรดตรวจสอบให้แน่ใจว่าคุณตรงตามเงื่อนไขต่อไปนี้ ก่อนลดระดับเป็น <name/>',
    downgrade_help_tip: 'ต้องการความช่วยเหลือ? <a>ติดต่อเรา</a>',
    upgrade_title: 'แจ้งเตือนสำหรับผู้ใช้ยุคแรกที่เราให้ความสำคัญ',
    upgrade_description:
      'ตอนนี้คุณใช้งานเกินกว่าที่ <name /> กำหนดไว้แล้ว Logto ได้เปิดตัวอย่างเป็นทางการ พร้อมฟีเจอร์ที่เหมาะสมกับแต่ละแผน ก่อนที่คุณจะอัปเกรดเป็น <name /> กรุณาตรวจสอบเงื่อนไขต่อไปนี้ให้ครบถ้วน',
    upgrade_pro_tip: ' หรือพิจารณาอัปเกรดเป็นแผน Pro',
    upgrade_help_tip: 'ต้องการความช่วยเหลือเลื่อนระดับ? <a>ติดต่อเรา</a>',
    a_maximum_of: 'สูงสุด <item/>',
  },
  upgrade_success: 'อัปเกรดเป็น <name/> สำเร็จแล้ว',
  downgrade_success: 'ลดระดับเป็น <name/> สำเร็จแล้ว',
  subscription_check_timeout: 'การตรวจสอบการสมัครสมาชิกหมดเวลา กรุณารีเฟรชใหม่ภายหลัง',
  no_subscription: 'ไม่มีการสมัครสมาชิก',
  usage,
  token_usage_notification: {
    exceeded:
      'คุณใช้เกินโควต้า 100% แล้ว ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้อย่างถูกต้อง กรุณาอัปเกรดทันทีเพื่อหลีกเลี่ยงปัญหา',
    close_to_limit:
      'คุณใกล้จะถึงขีดจำกัดการใช้โทเคนแล้ว Logto จะหยุดออกโทเคนเมื่อการใช้งานเกิน 100% กรุณาอัปเกรดแผนฟรีเพื่อหลีกเลี่ยงปัญหา',
    dev_plan_exceeded: 'เช่าใช้งานนี้ถึงขีดจำกัดโทเคนตามนโยบายขีดจำกัดของ Logto แล้ว',
  },
};

export default Object.freeze(subscription);
