const enterprise_sso_details = {
  back_to_sso_connectors: 'กลับไปที่ SSO สำหรับองค์กร',
  page_title: 'รายละเอียดตัวเชื่อมต่อ SSO สำหรับองค์กร',
  readme_drawer_title: 'SSO สำหรับองค์กร',
  readme_drawer_subtitle: 'ตั้งค่าตัวเชื่อมต่อ SSO สำหรับองค์กรเพื่อให้ผู้ใช้สามารถเข้าใช้งาน SSO',
  tab_experience: 'ประสบการณ์ SSO',
  tab_connection: 'การเชื่อมต่อ',
  tab_idp_initiated_auth: 'SSO ที่เริ่มโดย IdP',
  general_settings_title: 'ทั่วไป',
  general_settings_description:
    'กำหนดค่าประสบการณ์ของผู้ใช้และเชื่อมต่อโดเมนอีเมลขององค์กรสำหรับกระบวนการ SP-initiated SSO.',
  custom_branding_title: 'การแสดงผล',
  custom_branding_description:
    'ปรับแต่งชื่อและโลโก้ที่จะแสดงในขั้นตอน Single Sign-On ของผู้ใช้ หากไม่ระบุจะใช้ค่าตั้งต้นแทน',
  email_domain_field_name: 'โดเมนอีเมลขององค์กร',
  email_domain_field_description:
    'ผู้ใช้ที่มีโดเมนอีเมลเหล่านี้สามารถใช้ SSO สำหรับการยืนยันตัวตน กรุณาตรวจสอบความเป็นเจ้าของโดเมนก่อนเพิ่ม',
  email_domain_field_placeholder: 'กรอกโดเมนอีเมลหนึ่งหรือมากกว่า (เช่น yourcompany.com)',
  sync_profile_field_name: 'ซิงค์ข้อมูลโปรไฟล์จาก Identity Provider',
  sync_profile_option: {
    register_only: 'ซิงค์เฉพาะตอนเข้าสู่ระบบครั้งแรก',
    each_sign_in: 'ซิงค์ทุกครั้งที่เข้าสู่ระบบ',
  },
  connector_name_field_name: 'ชื่อตัวเชื่อมต่อ',
  display_name_field_name: 'ชื่อที่แสดง',
  connector_logo_field_name: 'โลโก้ที่แสดง',
  connector_logo_field_description:
    'แต่ละภาพต้องมีขนาดไม่เกิน 500KB, เฉพาะ SVG, PNG, JPG, JPEG เท่านั้น',
  branding_logo_context: 'อัปโหลดโลโก้',
  branding_logo_error: 'เกิดข้อผิดพลาดในการอัปโหลดโลโก้: {{error}}',
  branding_light_logo_context: 'อัปโหลดโลโก้สำหรับโหมดสว่าง',
  branding_light_logo_error: 'เกิดข้อผิดพลาดในการอัปโหลดโลโก้โหมดสว่าง: {{error}}',
  branding_logo_field_name: 'โลโก้',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: 'อัปโหลดโลโก้สำหรับโหมดมืด',
  branding_dark_logo_error: 'เกิดข้อผิดพลาดในการอัปโหลดโลโก้โหมดมืด: {{error}}',
  branding_dark_logo_field_name: 'โลโก้ (โหมดมืด)',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: 'คำแนะนำการเชื่อมต่อ',
  enterprise_sso_deleted: 'ตัวเชื่อมต่อ SSO สำหรับองค์กรถูกลบเรียบร้อยแล้ว',
  delete_confirm_modal_title: 'ลบตัวเชื่อมต่อ SSO สำหรับองค์กร',
  delete_confirm_modal_content:
    'คุณแน่ใจหรือว่าต้องการลบตัวเชื่อมต่อนี้? ผู้ใช้จาก Identity Provider จะไม่สามารถใช้ Single Sign-On ได้',
  upload_idp_metadata_title_saml: 'อัปโหลดข้อมูล Metadata',
  upload_idp_metadata_description_saml: 'ตั้งค่าข้อมูล metadata ที่คัดลอกจาก Identity Provider',
  upload_idp_metadata_title_oidc: 'อัปโหลดข้อมูล Credentials',
  upload_idp_metadata_description_oidc:
    'ตั้งค่า Credentials และข้อมูล OIDC Token ที่คัดลอกจาก Identity Provider',
  upload_idp_metadata_button_text: 'อัปโหลดไฟล์ metadata XML',
  upload_signing_certificate_button_text: 'อัปโหลดไฟล์ใบรับรองการลงนาม',
  configure_domain_field_info_text:
    'เพิ่มโดเมนอีเมลเพื่อแนะนำผู้ใช้ขององค์กรไปยัง Identity Provider สำหรับ Single Sign-on',
  email_domain_field_required: 'ต้องระบุโดเมนอีเมลเพื่อเปิดใช้งาน SSO สำหรับองค์กร',
  upload_saml_idp_metadata_info_text_url:
    'วาง URL metadata ที่ได้จาก Identity Provider เพื่อเชื่อมต่อ',
  upload_saml_idp_metadata_info_text_xml: 'วาง metadata ที่ได้จาก Identity Provider เพื่อเชื่อมต่อ',
  upload_saml_idp_metadata_info_text_manual:
    'กรอก metadata ที่ได้จาก Identity Provider เพื่อเชื่อมต่อ',
  upload_oidc_idp_info_text: 'กรอกข้อมูลที่ได้จาก Identity Provider เพื่อเชื่อมต่อ',
  service_provider_property_title: 'ตั้งค่าใน IdP',
  service_provider_property_description:
    'ตั้งค่า Integration สำหรับแอปโดยใช้ {{protocol}} บน Identity Provider ของคุณ และกรอกรายละเอียดที่ได้จาก Logto',
  attribute_mapping_title: 'การจับคู่ Attributes',
  attribute_mapping_description:
    'ซิงค์โปรไฟล์ผู้ใช้จาก Identity Provider โดยตั้งค่าการจับคู่ attribute ผู้ใช้ไม่ว่าจะทางฝั่ง Identity Provider หรือ Logto',
  saml_preview: {
    sign_on_url: 'URL สำหรับ Sign on',
    entity_id: 'Issuer',
    x509_certificate: 'ใบรับรองการลงนาม',
    certificate_content: 'จะหมดอายุ {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'จุดให้สิทธิ์ (Authorization endpoint)',
    token_endpoint: 'จุดโทเคน (Token endpoint)',
    userinfo_endpoint: 'จุดข้อมูลผู้ใช้ (User information endpoint)',
    jwks_uri: 'จุด JSON web key set',
    issuer: 'Issuer',
  },
  idp_initiated_auth_config: {
    card_title: 'SSO ที่เริ่มโดย IdP',
    card_description:
      'ผู้ใช้โดยทั่วไปจะเริ่มกระบวนการยืนยันตัวตนจากแอปของคุณโดยใช้ SP-initiated SSO กรุณาอย่าเปิดใช้งานคุณสมบัตินี้หากไม่จำเป็นจริง ๆ',
    enable_idp_initiated_sso: 'เปิดใช้งาน SSO ที่เริ่มโดย IdP',
    enable_idp_initiated_sso_description:
      'อนุญาตให้ผู้ใช้ขององค์กรเริ่มกระบวนการยืนยันตัวตนโดยตรงจากหน้า Identity Provider โปรดเข้าใจความเสี่ยงด้านความปลอดภัยก่อนเปิดใช้งาน',
    default_application: 'แอปพลิเคชันเริ่มต้น',
    default_application_tooltip: 'แอปเป้าหมายที่ผู้ใช้จะถูกเปลี่ยนเส้นทางหลังจากเข้าสู่ระบบ',
    empty_applications_error: 'ไม่พบแอปพลิเคชัน กรุณาเพิ่มในส่วน <a>แอปพลิเคชัน</a> ก่อน',
    empty_applications_placeholder: 'ไม่มีแอปพลิเคชัน',
    authentication_type: 'ประเภทการยืนยันตัวตน',
    auto_authentication_disabled_title: 'เปลี่ยนเส้นทางไปยัง client สำหรับ SP-initiated SSO',
    auto_authentication_disabled_description:
      'แนะนำให้ใช้ เปลี่ยนเส้นทางผู้ใช้ไปที่แอปฝั่ง client เพื่อเริ่มการพนันตัวตนแบบ SP-initiated OIDC ที่ปลอดภัย จะช่วยป้องกันการโจมตีแบบ CSRF',
    auto_authentication_enabled_title: 'เข้าสู่ระบบโดยตรงด้วย SSO ที่เริ่มโดย IdP',
    auto_authentication_enabled_description:
      'หลังจากเข้าสู่ระบบสำเร็จ ผู้ใช้จะถูกเปลี่ยนเส้นทางไปยัง Redirect URI พร้อม authorization code (โดยไม่มี state และ PKCE validation)',
    auto_authentication_disabled_app: 'สำหรับเว็บแอปแบบดั้งเดิม, single-page app (SPA)',
    auto_authentication_enabled_app: 'สำหรับเว็บแอปแบบดั้งเดิม',
    idp_initiated_auth_callback_uri: 'Client callback URI',
    idp_initiated_auth_callback_uri_tooltip:
      'Client callback URI เพื่อเริ่มการยืนยันตัวตนแบบ SP-initiated SSO โดยจะเพิ่ม ssoConnectorId เป็น query parameter (เช่น https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: 'Post sign-in redirect URI',
    redirect_uri_tooltip:
      'Redirect URI สำหรับเปลี่ยนเส้นทางผู้ใช้หลังเข้าสู่ระบบ Logto จะใช้ URI นี้เป็น OIDC redirect URI ในคำขอ authorization แนะนำให้ใช้ URI พิเศษสำหรับ SSO ที่เริ่มโดย IdP เพื่อความปลอดภัย',
    empty_redirect_uris_error: 'ยังไม่มีการลงทะเบียน Redirect URI สำหรับแอปนี้ กรุณาเพิ่มก่อน',
    redirect_uri_placeholder: 'เลือก URI สำหรับเปลี่ยนเส้นทางหลังเข้าสู่ระบบ',
    auth_params: 'พารามิเตอร์เสริมสำหรับการยืนยันตัวตน',
    auth_params_tooltip:
      'พารามิเตอร์เพิ่มเติมใน authorization request โดยค่าตั้งต้นจะขอเพียง scope (openid profile) หากต้องการ scope อื่นหรือ state ที่กำหนดเอง ให้ระบุที่นี่ (เช่น { "scope": "organizations email", "state": "secret_state" })',
  },
  trust_unverified_email: 'เชื่อถืออีเมลที่ยังไม่ได้ยืนยัน',
  trust_unverified_email_label:
    'เชื่อถือที่อยู่อีเมลที่ยังไม่ได้ยืนยันที่ส่งกลับจาก Identity Provider เสมอ',
  trust_unverified_email_tip:
    'ตัวเชื่อมต่อ Entra ID (OIDC) ไม่ได้ส่ง claim `email_verified` หมายความว่าอีเมลที่ได้จาก Azure อาจยังไม่ได้รับการยืนยัน โดยปกติแล้ว Logto จะไม่ซิงค์อีเมลที่ยังไม่ได้รับการยืนยันไปยังโปรไฟล์ผู้ใช้ เปิดใช้งานตัวเลือกนี้หากคุณเชื่อถืออีเมลทั้งหมดจากไดเรกทอรี Entra ID',
  offline_access: {
    label: 'รีเฟรช access token',
    description:
      'เปิดใช้งาน Google `offline` access เพื่อขอ refresh token ช่วยให้แอปของคุณรีเฟรช access token ได้โดยไม่ต้องให้ผู้ใช้ยืนยันสิทธิ์อีกครั้ง',
  },
};

export default Object.freeze(enterprise_sso_details);
