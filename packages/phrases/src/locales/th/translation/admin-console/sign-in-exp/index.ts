import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'ประสบการณ์การเข้าสู่ระบบ',
  title: 'ประสบการณ์การเข้าสู่ระบบ',
  description:
    'ปรับแต่งกระบวนการยืนยันตัวตนและ UI พร้อมดูตัวอย่างประสบการณ์ใช้งานทันทีแบบเรียลไทม์',
  tabs: {
    branding: 'การสร้างแบรนด์',
    sign_up_and_sign_in: 'สมัครและเข้าสู่ระบบ',
    content: 'เนื้อหา',
    collect_user_profile: 'เก็บข้อมูลโปรไฟล์ผู้ใช้',
    password_policy: 'นโยบายรหัสผ่าน',
  },
  welcome: {
    title: 'ปรับแต่งประสบการณ์เข้าสู่ระบบ',
    description:
      'เริ่มต้นง่าย ๆ กับการตั้งค่าเข้าสู่ระบบครั้งแรก คู่มือนี้จะแนะนำคุณตลอดการตั้งค่าทั้งหมดที่จำเป็น',
    get_started: 'เริ่มต้น',
    apply_remind: 'โปรดทราบว่า ประสบการณ์การเข้าสู่ระบบจะถูกนำไปใช้กับทุกแอปพลิเคชันในบัญชีนี้',
  },
  color: {
    title: 'สี',
    primary_color: 'สีแบรนด์',
    dark_primary_color: 'สีแบรนด์ (โหมดมืด)',
    dark_mode: 'เปิดใช้งานโหมดมืด',
    dark_mode_description:
      'แอปของคุณจะมีธีมโหมดมืดที่สร้างอัตโนมัติตามสีแบรนด์ของคุณและอัลกอริทึม Logto คุณสามารถปรับแต่งได้ตามต้องการ',
    dark_mode_reset_tip: 'คำนวณสีโหมดมืดใหม่ตามสีแบรนด์',
    reset: 'คำนวณใหม่',
  },
  branding: {
    title: 'พื้นที่แบรนด์',
    ui_style: 'สไตล์',
    with_light: '{{value}}',
    with_dark: '{{value}} (โหมดมืด)',
    app_logo_and_favicon: 'โลโก้แอปและ Favicon',
    company_logo_and_favicon: 'โลโก้บริษัทและ Favicon',
  },
  branding_uploads: {
    app_logo: {
      title: 'โลโก้แอป',
      url: 'URL โลโก้แอป',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'โลโก้แอป: {{error}}',
    },
    company_logo: {
      title: 'โลโก้บริษัท',
      url: 'URL โลโก้บริษัท',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'โลโก้บริษัท: {{error}}',
    },
    organization_logo: {
      title: 'อัปโหลดรูปภาพ',
      url: 'URL โลโก้องค์กร',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'โลโก้องค์กร: {{error}}',
    },
    connector_logo: {
      title: 'อัปโหลดรูปภาพ',
      url: 'URL โลโก้คอนเนคเตอร์',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'โลโก้คอนเนคเตอร์: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL Favicon',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'ปรับแต่ง UI',
    css_code_editor_title: 'CSS ที่กำหนดเอง',
    css_code_editor_description1: 'ดูตัวอย่าง CSS ที่กำหนดเอง',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'เรียนรู้เพิ่มเติม',
    css_code_editor_content_placeholder:
      'ใส่ CSS ที่คุณกำหนดเองเพื่อตกแต่งสไตล์ได้ตามที่คุณต้องการ แสดงความคิดสร้างสรรค์และทำให้ UI ของคุณโดดเด่น',
    bring_your_ui_title: 'นำ UI ของคุณมาเอง',
    bring_your_ui_description:
      'อัปโหลดไฟล์บีบอัด (.zip) เพื่อแทนที่ UI สำเร็จรูปของ Logto ด้วยโค้ดของคุณเอง <a>เรียนรู้เพิ่มเติม</a>',
    preview_with_bring_your_ui_description:
      'ไฟล์ UI ที่คุณกำหนดเองถูกอัปโหลดเรียบร้อยแล้วและกำลังใช้งานอยู่ ดังนั้นหน้าต่างตัวอย่างแบบฝังจึงถูกปิดใช้งาน\nหากต้องการทดสอบหน้าเข้าสู่ระบบแบบกำหนดเอง ให้คลิกปุ่ม "แสดงตัวอย่างสด" เพื่อเปิดในแท็บใหม่',
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'ยังไม่ได้ตั้งค่า SMS connector ก่อนตั้งค่าให้เสร็จสมบูรณ์ ผู้ใช้จะไม่สามารถเข้าสู่ระบบด้วยวิธีนี้ได้ <a>{{link}}</a> ใน "Connectors"',
    no_connector_email:
      'ยังไม่ได้ตั้งค่า email connector ก่อนตั้งค่าให้เสร็จสมบูรณ์ ผู้ใช้จะไม่สามารถเข้าสู่ระบบด้วยวิธีนี้ได้ <a>{{link}}</a> ใน "Connectors"',
    no_connector_social:
      'คุณยังไม่ได้ตั้งค่าคอนเนคเตอร์โซเชียลใด ๆ เพิ่มคอนเนคเตอร์ก่อนเพื่อใช้งานวิธีเข้าสู่ระบบด้วยโซเชียล <a>{{link}}</a> ใน “Connectors”',
    setup_link: 'ตั้งค่า',
  },
  save_alert: {
    description:
      'คุณกำลังดำเนินการตั้งค่ากระบวนการสมัครและเข้าสู่ระบบใหม่ ผู้ใช้ทั้งหมดของคุณอาจได้รับผลกระทบจากการตั้งค่าใหม่นี้ คุณแน่ใจหรือไม่ว่าจะยืนยันการเปลี่ยนแปลงนี้?',
    before: 'ก่อน',
    after: 'หลัง',
    sign_up: 'สมัคร',
    sign_in: 'เข้าสู่ระบบ',
    social: 'โซเชียล',
  },
  preview: {
    title: 'ดูตัวอย่างการเข้าสู่ระบบ',
    live_preview: 'แสดงตัวอย่างสด',
    live_preview_tip: 'บันทึกเพื่อดูตัวอย่างการเปลี่ยนแปลง',
    native: 'เนทีฟ',
    desktop_web: 'เว็บเดสก์ท็อป',
    mobile_web: 'เว็บมือถือ',
    desktop: 'เดสก์ท็อป',
    mobile: 'มือถือ',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
