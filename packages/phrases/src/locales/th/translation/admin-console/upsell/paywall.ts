const paywall = {
  applications:
    '{{count, number}} แอปพลิเคชัน ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแผนเพื่อรองรับความต้องการของทีมคุณ หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>.',
  applications_other:
    '{{count, number}} แอปพลิเคชัน ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแผนเพื่อรองรับความต้องการของทีมคุณ หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>.',
  machine_to_machine_feature:
    'เปลี่ยนไปใช้แพ็กเกจ <strong>Pro</strong> เพื่อเพิ่มจำนวน machine-to-machine application และรับฟีเจอร์พรีเมียมทั้งหมด <a>ติดต่อเรา</a> หากมีคำถาม',
  machine_to_machine:
    '{{count, number}} machine-to-machine application ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแผนเพื่อรองรับความต้องการของทีมคุณ หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>.',
  machine_to_machine_other:
    '{{count, number}} machine-to-machine applications ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแผนเพื่อรองรับความต้องการของทีมคุณ หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>.',
  resources:
    '{{count, number}} API resource ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแผนเพื่อรองรับความต้องการของทีมของคุณ <a>ติดต่อเรา</a> หากต้องการความช่วยเหลือ',
  resources_other:
    '{{count, number}} API resources ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแผนเพื่อรองรับความต้องการของทีมของคุณ <a>ติดต่อเรา</a> หากต้องการความช่วยเหลือ',
  scopes_per_resource:
    '{{count, number}} สิทธิ์ต่อ API resource ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดเพื่อเพิ่มขนาด <a>ติดต่อเรา</a> หากต้องการความช่วยเหลือ',
  scopes_per_resource_other:
    '{{count, number}} สิทธิ์ต่อ API resource ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดเพื่อเพิ่มขนาด <a>ติดต่อเรา</a> หากต้องการความช่วยเหลือ',
  custom_domain:
    'ปลดล็อกฟังก์ชัน custom domain ด้วยการอัปเกรดเป็นแผน <strong>Hobby</strong> หรือ <strong>Pro</strong> หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  social_connectors:
    '{{count, number}} social connector ของ <planName/> ถึงขีดจำกัดแล้ว หากต้องการรองรับความต้องการของทีมคุณ กรุณาอัปเกรดแพ็กเกจเพื่อเพิ่ม social connectors และสามารถสร้าง connector ของคุณเองด้วย OIDC, OAuth 2.0 และ SAML หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  social_connectors_other:
    '{{count, number}} social connectors ของ <planName/> ถึงขีดจำกัดแล้ว หากต้องการรองรับความต้องการของทีมคุณ กรุณาอัปเกรดแพ็กเกจเพื่อเพิ่ม social connectors และสามารถสร้าง connector ของคุณเองด้วย OIDC, OAuth 2.0 และ SAML หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  standard_connectors_feature:
    'อัปเกรดเป็นแพ็กเกจ <strong>Hobby</strong> หรือ <strong>Pro</strong> เพื่อสร้างคอนเนคเตอร์ของคุณเองด้วย OIDC, OAuth 2.0 และ SAML พร้อมปลดล็อก social connectors แบบไม่จำกัดและฟีเจอร์พรีเมียมทั้งหมด หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  standard_connectors:
    '{{count, number}} social connector ของ <planName/> ถึงขีดจำกัดแล้ว หากต้องการรองรับความต้องการของทีมคุณ กรุณาอัปเกรดแพ็กเกจเพื่อเพิ่ม social connectors และสามารถสร้าง connector ของคุณเองด้วย OIDC, OAuth 2.0 และ SAML หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  standard_connectors_other:
    '{{count, number}} social connectors ของ <planName/> ถึงขีดจำกัดแล้ว หากต้องการรองรับความต้องการของทีมคุณ กรุณาอัปเกรดแพ็กเกจเพื่อเพิ่ม social connectors และสามารถสร้าง connector ของคุณเองด้วย OIDC, OAuth 2.0 และ SAML หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  standard_connectors_pro:
    '{{count, number}} standard connector ของ <planName/> ถึงขีดจำกัดแล้ว หากต้องการรองรับความต้องการของทีมคุณ อัปเกรดเป็นแผน Enterprise เพื่อเพิ่มจำนวน social connectors และสร้าง connector ของคุณเองด้วย OIDC, OAuth 2.0 และ SAML หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  standard_connectors_pro_other:
    '{{count, number}} standard connectors ของ <planName/> ถึงขีดจำกัดแล้ว หากต้องการรองรับความต้องการของทีมคุณ อัปเกรดเป็นแผน Enterprise เพื่อเพิ่มจำนวน social connectors และสร้าง connector ของคุณเองด้วย OIDC, OAuth 2.0 และ SAML หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  roles:
    'อัปเกรดแพ็กเกจเพื่อเพิ่มบทบาทและสิทธิ์เพิ่มเติม หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  scopes_per_role:
    '{{count, number}} สิทธิ์ต่อบทบาท ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแพ็กเกจเพื่อเพิ่มบทบาทและสิทธิ์เพิ่มเติม หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  scopes_per_role_other:
    '{{count, number}} สิทธิ์ต่อบทบาท ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแพ็กเกจเพื่อเพิ่มบทบาทและสิทธิ์เพิ่มเติม หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  saml_applications_oss:
    'สามารถใช้งาน SAML app เพิ่มเติมได้เมื่อใช้ Logto Enterprise หากต้องการความช่วยเหลือ กรุณาติดต่อเรา',
  logto_pricing_button_text: 'Logto Cloud ราคา',
  saml_applications:
    'สามารถใช้งาน SAML app เพิ่มเติมได้เมื่อใช้ Logto Enterprise หากต้องการความช่วยเหลือ กรุณาติดต่อเรา',
  saml_applications_add_on:
    'ปลดล็อกฟีเจอร์ SAML app ด้วยการอัปเกรดเป็นแผนชำระเงิน หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  hooks:
    '{{count, number}} webhook ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแพ็กเกจเพื่อสร้าง webhooks เพิ่ม หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  hooks_other:
    '{{count, number}} webhooks ของ <planName/> ถึงขีดจำกัดแล้ว อัปเกรดแพ็กเกจเพื่อสร้าง webhooks เพิ่ม หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  mfa: 'ปลดล็อก MFA เพื่อความปลอดภัยในการยืนยันตัวตนโดยการอัปเกรดเป็นแผนชำระเงิน หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  organizations:
    'ปลดล็อกฟีเจอร์องค์กรโดยการอัปเกรดเป็นแผนชำระเงิน หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  third_party_apps:
    'ปลดล็อก Logto สำหรับ third-party apps โดยการอัปเกรดเป็นแผนชำระเงิน หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  sso_connectors:
    'ปลดล็อก enterprise sso โดยการอัปเกรดเป็นแผนชำระเงิน หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  tenant_members:
    'ปลดล็อกฟีเจอร์การทำงานร่วมกันโดยการอัปเกรดเป็นแผนชำระเงิน หากต้องการความช่วยเหลือ โปรด <a>ติดต่อเรา</a>',
  tenant_members_dev_plan:
    'คุณถึงขีดจำกัดสมาชิก {{limit}} คนแล้ว ปล่อยสมาชิกออกหรือยกเลิกคำเชิญที่ค้างอยู่เพื่อเพิ่มคนใหม่ หากต้องการที่นั่งเพิ่มเติม โปรดติดต่อเรา',
  custom_jwt: {
    title: 'เพิ่ม custom claim',
    description:
      'อัปเกรดเป็นแผนชำระเงินเพื่อใช้งานฟีเจอร์ custom JWT และสิทธิประโยชน์พรีเมียม หากมีคำถาม โปรด <a>ติดต่อเรา</a>',
  },
  bring_your_ui:
    'อัปเกรดเป็นแผนชำระเงินเพื่อเปิดใช้งานการนำ UI ของคุณมาใช้เองและรับสิทธิประโยชน์พรีเมียม',
  security_features:
    'ปลดล็อกฟีเจอร์ความปลอดภัยระดับสูงโดยการอัปเกรดเป็นแผน Pro หากมีคำถาม โปรด <a>ติดต่อเรา</a>',
  collect_user_profile:
    'อัปเกรดเป็นแผนชำระเงินเพื่อรวบรวมข้อมูลโปรไฟล์ผู้ใช้เพิ่มเติมขณะสมัคร หากมีคำถาม โปรด <a>ติดต่อเรา</a>',
};

export default Object.freeze(paywall);
