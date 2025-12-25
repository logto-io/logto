import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'ประสบการณ์การเข้าสู่ระบบ',
  page_title_with_account: 'การเข้าสู่ระบบและบัญชี',
  title: 'การเข้าสู่ระบบและบัญชี',
  description:
    'ปรับแต่งกระบวนการยืนยันตัวตนและ UI พร้อมดูตัวอย่างประสบการณ์ใช้งานทันทีแบบเรียลไทม์',
  tabs: {
    branding: 'การสร้างแบรนด์',
    sign_up_and_sign_in: 'สมัครและเข้าสู่ระบบ',
    collect_user_profile: 'เก็บข้อมูลโปรไฟล์ผู้ใช้',
    account_center: 'ศูนย์บัญชี',
    content: 'เนื้อหา',
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
    organization_logo_and_favicon: 'โลโก้องค์กรและ Favicon',
    hide_logto_branding: 'ซ่อนแบรนด์ Logto',
    hide_logto_branding_description:
      'ลบ "Powered by Logto" เพื่อให้แบรนด์ของคุณโดดเด่นด้วยประสบการณ์ลงชื่อเข้าใช้ที่สะอาดและเป็นมืออาชีพ',
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
  account_center: {
    title: 'ศูนย์บัญชี',
    description: 'ปรับแต่งขั้นตอนศูนย์บัญชีของคุณด้วย Logto API.',
    enable_account_api: 'เปิดใช้งาน Account API',
    enable_account_api_description:
      'เปิดใช้งาน Account API เพื่อสร้างศูนย์บัญชีแบบกำหนดเอง ให้ผู้ใช้ปลายทางเข้าถึง API ได้โดยตรงโดยไม่ต้องใช้ Logto Management API.',
    field_options: {
      off: 'ปิด',
      edit: 'แก้ไข',
      read_only: 'อ่านอย่างเดียว',
      enabled: 'เปิดใช้งาน',
      disabled: 'ปิดใช้งาน',
    },
    sections: {
      account_security: {
        title: 'ความปลอดภัยของบัญชี',
        description:
          'จัดการการเข้าถึง Account API เพื่อให้ผู้ใช้สามารถดูหรือแก้ไขข้อมูลตัวตนและปัจจัยการยืนยันตัวตนหลังจากเข้าสู่ระบบแอปพลิเคชัน ผู้ใช้ต้องยืนยันตัวตนเพื่อรับรหัสบันทึกการยืนยันที่มีอายุ 10 นาทีก่อนทำการเปลี่ยนแปลงที่เกี่ยวข้องกับความปลอดภัยเหล่านี้.',
        groups: {
          identifiers: {
            title: 'ตัวระบุ',
          },
          authentication_factors: {
            title: 'ปัจจัยการยืนยันตัวตน',
          },
        },
      },
      user_profile: {
        title: 'โปรไฟล์ผู้ใช้',
        description:
          'จัดการการเข้าถึง Account API เพื่อให้ผู้ใช้สามารถดูหรือแก้ไขข้อมูลโปรไฟล์พื้นฐานหรือแบบกำหนดเองหลังจากเข้าสู่ระบบแอปพลิเคชัน.',
        groups: {
          profile_data: {
            title: 'ข้อมูลโปรไฟล์',
          },
        },
      },
      secret_vault: {
        title: 'ห้องนิรภัยลับ',
        description:
          'สำหรับคอนเนคเตอร์โซเชียลและองค์กร จัดเก็บโทเค็นการเข้าถึงของบุคคลที่สามอย่างปลอดภัยเพื่อเรียกใช้ API ของพวกเขา (เช่น เพิ่มกิจกรรมลงใน Google ปฏิทิน).',
        third_party_token_storage: {
          title: 'โทเค็นบุคคลที่สาม',
          third_party_access_token_retrieval: 'การดึงโทเค็นการเข้าถึงบุคคลที่สาม',
          third_party_token_tooltip:
            'หากต้องการจัดเก็บโทเค็น คุณสามารถเปิดใช้งานตัวเลือกนี้ได้ในการตั้งค่าของคอนเนคเตอร์โซเชียลหรือองค์กรที่เกี่ยวข้อง.',
          third_party_token_description:
            'เมื่อเปิดใช้งาน Account API แล้ว การดึงโทเค็นของบุคคลที่สามจะเปิดใช้งานโดยอัตโนมัติ.',
        },
      },
    },
    fields: {
      email: 'ที่อยู่อีเมล',
      phone: 'หมายเลขโทรศัพท์',
      social: 'ตัวตนโซเชียล',
      password: 'รหัสผ่าน',
      mfa: 'การยืนยันตัวตนหลายปัจจัย',
      mfa_description: 'ให้ผู้ใช้จัดการวิธี MFA จากศูนย์บัญชี.',
      username: 'ชื่อผู้ใช้',
      name: 'ชื่อ',
      avatar: 'อวตาร',
      profile: 'โปรไฟล์',
      profile_description: 'ควบคุมการเข้าถึงคุณลักษณะของโปรไฟล์ที่มีโครงสร้าง.',
      custom_data: 'ข้อมูลแบบกำหนดเอง',
      custom_data_description: 'ควบคุมการเข้าถึงข้อมูล JSON แบบกำหนดเองที่เก็บไว้กับผู้ใช้.',
    },
    webauthn_related_origins: 'ต้นทางที่เกี่ยวข้องกับ WebAuthn',
    webauthn_related_origins_description:
      'เพิ่มโดเมนของแอปพลิเคชันส่วนหน้าที่ได้รับอนุญาตให้ลงทะเบียน passkey ผ่าน Account API.',
    webauthn_related_origins_error: 'ต้นทางต้องขึ้นต้นด้วย https:// หรือ http://',
    prebuilt_ui: {
      /** UNTRANSLATED */
      title: 'INTEGRATE PREBUILT UI',
      /** UNTRANSLATED */
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      /** UNTRANSLATED */
      flows_title: 'Integrate out-of-the-box security setting flows',
      /** UNTRANSLATED */
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        /** UNTRANSLATED */
        email: 'Update your primary email address',
        /** UNTRANSLATED */
        phone: 'Update your primary phone number',
        /** UNTRANSLATED */
        username: 'Update your username',
        /** UNTRANSLATED */
        password: 'Set a new password',
        /** UNTRANSLATED */
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        /** UNTRANSLATED */
        passkey_add: 'Register a new passkey',
        /** UNTRANSLATED */
        passkey_manage: 'Manage your existing passkeys or add new ones',
        /** UNTRANSLATED */
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        /** UNTRANSLATED */
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      /** UNTRANSLATED */
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      /** UNTRANSLATED */
      customize_link: 'customize your flows with the Account API instead.',
    },
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'ยังไม่ได้ตั้งค่า SMS connector ก่อนตั้งค่าให้เสร็จสมบูรณ์ ผู้ใช้จะไม่สามารถเข้าสู่ระบบด้วยวิธีนี้ได้ <a>{{link}}</a> ใน "Connectors"',
    no_connector_email:
      'ยังไม่ได้ตั้งค่า email connector ก่อนตั้งค่าให้เสร็จสมบูรณ์ ผู้ใช้จะไม่สามารถเข้าสู่ระบบด้วยวิธีนี้ได้ <a>{{link}}</a> ใน "Connectors"',
    no_connector_social:
      'คุณยังไม่ได้ตั้งค่าคอนเนคเตอร์โซเชียลใด ๆ เพิ่มคอนเนคเตอร์ก่อนเพื่อใช้งานวิธีเข้าสู่ระบบด้วยโซเชียล <a>{{link}}</a> ใน "Connectors"',
    no_connector_email_account_center:
      'ยังไม่ได้ตั้งค่าคอนเนคเตอร์อีเมล ตั้งค่าใน <a>"คอนเนคเตอร์อีเมลและ SMS"</a>',
    no_connector_sms_account_center:
      'ยังไม่ได้ตั้งค่าคอนเนคเตอร์ SMS ตั้งค่าใน <a>"คอนเนคเตอร์อีเมลและ SMS"</a>',
    no_connector_social_account_center:
      'ยังไม่ได้ตั้งค่าคอนเนคเตอร์โซเชียล ตั้งค่าใน <a>"คอนเนคเตอร์โซเชียล"</a>',
    no_mfa_factor: 'ยังไม่ได้ตั้งค่า MFA factor กรุณาตั้งค่าใน <a>{{link}}</a>.',
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
    forgot_password_migration_notice:
      'เราได้อัปเกรดการยืนยันรหัสผ่านที่ลืมเพื่อรองรับวิธีการแบบกำหนดเอง ก่อนหน้านี้ สิ่งนี้ถูกกำหนดโดยอัตโนมัติโดยตัวเชื่อมต่ออีเมลและ SMS ของคุณ คลิก<strong>ยืนยัน</strong>เพื่อทำการอัปเกรดให้เสร็จสิ้น',
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
