const application_details = {
  page_title: 'รายละเอียดแอปพลิเคชัน',
  back_to_applications: 'กลับไปยังแอปพลิเคชัน',
  check_guide: 'ตรวจสอบคู่มือ',
  settings: 'การตั้งค่า',
  settings_description:
    '“แอปพลิเคชัน” คือซอฟต์แวร์หรือบริการที่ลงทะเบียนไว้ซึ่งสามารถเข้าถึงข้อมูลผู้ใช้หรือดำเนินการแทนผู้ใช้ได้ แอปพลิเคชันช่วยให้สามารถระบุได้ว่าใครกำลังขอข้อมูลอะไรจาก Logto และจัดการการลงชื่อเข้าใช้และการให้สิทธิ์ กรุณากรอกฟิลด์ที่จำเป็นสำหรับการตรวจสอบตัวตน',
  integration: 'การผสานรวม',
  integration_description:
    "ปรับใช้ด้วย Logto secure workers ที่ขับเคลื่อนโดย Cloudflare's edge network เพื่อประสิทธิภาพระดับสูงและเริ่มต้นแบบไม่หน่วงทั่วโลก",
  service_configuration: 'การกำหนดค่าบริการ',
  service_configuration_description: 'กรอกการกำหนดค่าที่จำเป็นในบริการของคุณให้ครบถ้วน',
  session: 'เซสชัน',
  endpoints_and_credentials: 'Endpoint & ข้อมูลรับรอง',
  endpoints_and_credentials_description:
    'ใช้ endpoint และข้อมูลรับรองต่อไปนี้เพื่อตั้งค่าการเชื่อมต่อ OIDC ในแอปพลิเคชันของคุณ',
  refresh_token_settings: 'Refresh token',
  refresh_token_settings_description: 'จัดการกฎ refresh token สำหรับแอปพลิเคชันนี้',
  machine_logs: 'บันทึกของเครื่อง',
  application_name: 'ชื่อแอปพลิเคชัน',
  application_name_placeholder: 'แอปของฉัน',
  description: 'คำอธิบาย',
  description_placeholder: 'กรอกคำอธิบายแอปพลิเคชันของคุณ',
  config_endpoint: 'OpenID provider configuration endpoint',
  issuer_endpoint: 'Issuer endpoint',
  jwks_uri: 'JWKS URI',
  authorization_endpoint: 'Authorization endpoint',
  authorization_endpoint_tip:
    'Endpoint สำหรับดำเนินการตรวจสอบตัวตนและการให้สิทธิ์ ใช้กับ OpenID Connect <a>Authentication</a>',
  show_endpoint_details: 'แสดงรายละเอียด endpoint',
  hide_endpoint_details: 'ซ่อนรายละเอียด endpoint',
  logto_endpoint: 'Logto endpoint',
  application_id: 'App ID',
  application_id_tip:
    'รหัสประจำตัวแอปพลิเคชันที่ไม่ซ้ำกันซึ่งโดยทั่วไปจะถูกสร้างขึ้นโดย Logto โดยจะเป็นค่า “<a>client_id</a>” ใน OpenID Connect',
  application_secret: 'App secret',
  application_secret_other: 'App secrets',
  redirect_uri: 'Redirect URI',
  redirect_uris: 'Redirect URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI สำหรับ redirect หลังจากผู้ใช้ลงชื่อเข้าใช้ (ไม่ว่าจะสำเร็จหรือไม่) ดูข้อมูลเพิ่มเติมใน OpenID Connect <a>AuthRequest</a>',
  mixed_redirect_uri_warning:
    'ประเภทแอปพลิเคชันของคุณไม่เข้ากันกับ Redirect URI อย่างน้อยหนึ่งรายการ ซึ่งไม่เป็นไปตามแนวทางที่แนะนำและแนะนำให้ตั้งค่า Redirect URIs ให้สอดคล้องกัน',
  post_sign_out_redirect_uri: 'Post sign-out redirect URI',
  post_sign_out_redirect_uris: 'Post sign-out redirect URIs',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'URI สำหรับ redirect หลังจากผู้ใช้ลงชื่อออก (ไม่จำเป็น) อาจไม่มีผลในแอปบางประเภท',
  cors_allowed_origins: 'CORS allowed origins',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'โดยค่าเริ่มต้น ต้นกำเนิดทั้งหมดของ Redirect URIs จะได้รับอนุญาต โดยปกติไม่ต้องดำเนินการสำหรับฟิลด์นี้ ดู <a>MDN doc</a> สำหรับข้อมูลเพิ่มเติม',
  token_endpoint: 'Token endpoint',
  user_info_endpoint: 'Userinfo endpoint',
  enable_admin_access: 'เปิดการเข้าถึงแอดมิน',
  enable_admin_access_label:
    'เปิดหรือปิดการเข้าถึง Management API เมื่อเปิดใช้งานแล้ว คุณสามารถใช้ access token เพื่อเรียก Management API ในนามของแอปนี้ได้',
  always_issue_refresh_token: 'ออก refresh token เสมอ',
  always_issue_refresh_token_label:
    'เมื่อเปิดใช้งาน Logto จะออก refresh token เสมอ ไม่ว่าจะใช้ `prompt=consent` ในคำขอการตรวจสอบตัวตนหรือไม่ อย่างไรก็ตาม ไม่แนะนำเว้นแต่จำเป็น เนื่องจากไม่เข้ากันกับ OpenID Connect และอาจก่อให้เกิดปัญหา',
  refresh_token_ttl: 'Refresh token อายุ (TTL) เป็นวัน',
  refresh_token_ttl_tip:
    'ระยะเวลาที่ refresh token สามารถใช้เพื่อขอ access token ใหม่ก่อนจะหมดอายุและกลายเป็นโมฆะ การขอ token จะขยาย TTL ของ refresh token ไปยังค่านี้',
  rotate_refresh_token: 'หมุน refresh token',
  rotate_refresh_token_label:
    'เมื่อเปิดใช้งาน Logto จะออก refresh token ใหม่เมื่อขอ token เมื่อผ่านไป 70% ของ TTL ดั้งเดิมหรือเมื่อเข้าเงื่อนไขที่กำหนด <a>เรียนรู้เพิ่มเติม</a>',
  rotate_refresh_token_label_for_public_clients:
    'เมื่อเปิดใช้งาน Logto จะออก refresh token ใหม่สำหรับการขอ token แต่ละครั้ง <a>เรียนรู้เพิ่มเติม</a>',
  backchannel_logout: 'Backchannel Logout',
  backchannel_logout_description:
    'กำหนดค่า OpenID Connect backchannel logout endpoint และกำหนดว่าเซสชันจำเป็นสำหรับแอปนี้หรือไม่',
  backchannel_logout_uri: 'Backchannel logout URI',
  backchannel_logout_uri_session_required: 'ต้องใช้เซสชันหรือไม่?',
  backchannel_logout_uri_session_required_description:
    'เมื่อเปิดใช้งาน RP ต้องมี claim `sid` (session ID) ใน logout token เพื่อระบุเซสชัน RP กับ OP เมื่อใช้ `backchannel_logout_uri`',
  delete_description:
    'การดำเนินการนี้ไม่สามารถย้อนกลับได้ จะลบแอปพลิเคชันนี้อย่างถาวร กรุณากรอกชื่อแอปพลิเคชัน <span>{{name}}</span> เพื่อยืนยัน',
  enter_your_application_name: 'กรอกชื่อแอปพลิเคชันของคุณ',
  application_deleted: 'ลบแอปพลิเคชัน {{name}} เรียบร้อยแล้ว',
  redirect_uri_required: 'คุณต้องกรอกอย่างน้อย 1 Redirect URI',
  app_domain_description_1:
    'คุณสามารถใช้โดเมนของคุณกับ {{domain}} ที่ขับเคลื่อนโดย Logto ได้โดยไม่มีวันหมดอายุ',
  app_domain_description_2:
    'คุณสามารถใช้โดเมนของคุณ <domain>{{domain}}</domain> ได้โดยไม่มีวันหมดอายุ',
  custom_rules: 'กฎการตรวจสอบตัวตนแบบกำหนดเอง',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    'ตั้งค่ากฎด้วยรูปแบบ regular expression สำหรับเส้นทางที่ต้องตรวจสอบตัวตน ค่าเริ่มต้น: ป้องกันทั้งเว็บหากเว้นว่างไว้',
  authentication_routes: 'เส้นทางการตรวจสอบตัวตน',
  custom_rules_tip:
    "ตัวอย่าง:<ol><li>ต้องการป้องกันเฉพาะเส้นทาง '/admin' และ '/privacy' ด้วยการตรวจสอบ: ^/(admin|privacy)/.*</li><li>ต้องการยกเว้นไฟล์ภาพ JPG จากการตรวจสอบ: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    'เปลี่ยนเส้นทางปุ่มตรวจสอบตัวตนของคุณไปยังเส้นทางที่ระบุ หมายเหตุ: เส้นทางเหล่านี้ไม่สามารถแทนที่ได้',
  protect_origin_server: 'ปกป้องเซิร์ฟเวอร์ต้นทางของคุณ',
  protect_origin_server_description:
    'โปรดปกป้องเซิร์ฟเวอร์ต้นทางของคุณจากการถูกเข้าถึงโดยตรง ดูคู่มือเพื่อรับ <a>คำแนะนำเพิ่มเติม</a>',
  third_party_settings_description:
    'ผสานแอปพลิเคชันบุคคลที่สามกับ Logto ในฐานะผู้ให้บริการตัวตน (IdP) โดยใช้ OIDC / OAuth 2.0 พร้อมหน้าจอยินยอมสำหรับการอนุญาตผู้ใช้',
  session_duration: 'ระยะเวลาเซสชัน (วัน)',
  try_it: 'ลองใช้งาน',
  no_organization_placeholder: 'ไม่พบองค์กร <a>ไปยังหน้าองค์กร</a>',
  field_custom_data: 'ข้อมูลกำหนดเอง',
  field_custom_data_tip:
    'ข้อมูลเพิ่มเติมที่ไม่อยู่ในคุณสมบัติแอปที่กำหนดไว้ล่วงหน้าเช่น ข้อมูลธุรกิจหรือการตั้งค่าเฉพาะ',
  custom_data_invalid: 'ข้อมูลกำหนดเองต้องเป็น JSON object ที่ถูกต้อง',
  branding: {
    name: 'การสร้างแบรนด์',
    description: 'ปรับแต่งโลโก้แอปและสีแบรนด์สำหรับประสบการณ์ในระดับแอป',
    description_third_party: 'ปรับแต่งชื่อที่แสดงและโลโก้ของแอปพลิเคชันบนหน้าจอยินยอม',
    app_logo: 'โลโก้แอป',
    app_level_sie: 'ประสบการณ์เซ็นอินระดับแอป',
    app_level_sie_switch:
      'เปิดใช้งานประสบการณ์เซ็นอินระดับแอปพร้อมตั้งค่าแบรนด์ของแอปของคุณ หากปิดจะใช้ประสบการณ์เซ็นอินแบบศูนย์รวม',
    more_info: 'ข้อมูลเพิ่มเติม',
    more_info_description: 'ให้ข้อมูลเพิ่มเติมเกี่ยวกับแอปพลิเคชันของคุณแก่ผู้ใช้บนหน้าจอยินยอม',
    display_name: 'ชื่อที่แสดง',
    application_logo: 'โลโก้แอปพลิเคชัน',
    application_logo_dark: 'โลโก้แอปพลิเคชัน (โหมดมืด)',
    brand_color: 'สีแบรนด์',
    brand_color_dark: 'สีแบรนด์ (โหมดมืด)',
    terms_of_use_url: 'URL ข้อกำหนดการใช้งานแอปพลิเคชัน',
    privacy_policy_url: 'URL นโยบายความเป็นส่วนตัวของแอปพลิเคชัน',
  },
  permissions: {
    name: 'สิทธิ์',
    description: 'เลือกสิทธิ์ที่แอปบุคคลที่สามต้องการสำหรับการอนุญาตผู้ใช้เข้าถึงข้อมูลบางประเภท',
    user_permissions: 'ข้อมูลผู้ใช้ส่วนบุคคล',
    organization_permissions: 'การเข้าถึงองค์กร',
    table_name: 'รายการสิทธิ์',
    field_name: 'สิทธิ์',
    field_description: 'แสดงบนหน้าจอยินยอม',
    delete_text: 'ลบสิทธิ์นี้',
    permission_delete_confirm:
      'การดำเนินการนี้จะเพิกถอนสิทธิ์ที่แอปบุคคลที่สามได้รับ ทำให้ไม่สามารถขออนุญาตผู้ใช้สำหรับข้อมูลประเภทนั้น ๆ คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
    permissions_assignment_description:
      'เลือกสิทธิ์ที่แอปบุคคลที่สามร้องขอสำหรับการอนุญาตผู้ใช้ในการเข้าถึงข้อมูลบางประเภท',
    user_profile: 'ข้อมูลผู้ใช้',
    api_permissions: 'สิทธิ์ API',
    organization: 'สิทธิ์องค์กร',
    user_permissions_assignment_form_title: 'เพิ่มสิทธิ์ข้อมูลผู้ใช้',
    organization_permissions_assignment_form_title: 'เพิ่มสิทธิ์ข้อมูลองค์กร',
    api_resource_permissions_assignment_form_title: 'เพิ่มสิทธิ์ API resource',
    user_data_permission_description_tips:
      'คุณสามารถแก้ไขคำอธิบายสิทธิ์ข้อมูลผู้ใช้ได้ที่ "ประสบการณ์เซ็นอิน > เนื้อหา > จัดการภาษา"',
    permission_description_tips:
      'เมื่อใช้ Logto เป็นผู้ให้บริการตัวตน (IdP) กับแอปบุคคลที่สามและขออนุญาตผู้ใช้ คำอธิบายนี้จะแสดงบนหน้าจอยินยอม',
    user_title: 'ผู้ใช้',
    user_description: 'เลือกสิทธิ์ที่แอปบุคคลที่สามร้องขอสำหรับใช้เข้าถึงข้อมูลผู้ใช้',
    grant_user_level_permissions: 'ให้สิทธิ์ข้อมูลผู้ใช้',
    organization_title: 'องค์กร',
    organization_description: 'เลือกสิทธิ์ที่แอปบุคคลที่สามร้องขอสำหรับใช้เข้าถึงข้อมูลองค์กร',
    grant_organization_level_permissions: 'ให้สิทธิ์ข้อมูลองค์กร',
  },
  roles: {
    assign_button: 'กำหนดบทบาท',
    delete_description:
      'การดำเนินการนี้จะลบบทบาทนี้ออกจากแอป machine-to-machine นี้ ตัวบทบาทยังคงอยู่ แต่จะไม่เกี่ยวข้องกับแอปนี้อีก',
    deleted: 'ลบ {{name}} ออกจากผู้ใช้นี้เรียบร้อยแล้ว',
    assign_title: 'กำหนดบทบาทให้กับ {{name}}',
    assign_subtitle:
      'แอป machine-to-machine ต้องมีบทบาทที่เหมาะสมเพื่อเข้าใช้งาน API ที่เกี่ยวข้อง',
    assign_role_field: 'กำหนดบทบาท',
    role_search_placeholder: 'ค้นหาด้วยชื่อบทบาท',
    added_text: 'เพิ่มแล้ว {{value, number}}',
    assigned_app_count: '{{value, number}} แอปพลิเคชัน',
    confirm_assign: 'กำหนดบทบาท',
    role_assigned: 'กำหนดบทบาทเรียบร้อยแล้ว',
    search: 'ค้นหาจากชื่อบทบาท คำอธิบาย หรือ ID',
    empty: 'ไม่มีบทบาทให้เลือก',
  },
  secrets: {
    value: 'ค่า',
    empty: 'แอปพลิเคชันนี้ไม่มี secrets ใด ๆ',
    created_at: 'สร้างเมื่อ',
    expires_at: 'หมดอายุเมื่อ',
    never: 'ไม่หมดอายุ',
    create_new_secret: 'สร้าง secret ใหม่',
    delete_confirmation:
      'การดำเนินการนี้ไม่สามารถย้อนกลับได้ คุณแน่ใจหรือไม่ว่าต้องการลบ secret นี้?',
    deleted: 'ลบ secret เรียบร้อยแล้ว',
    activated: 'เปิดใช้งาน secret เรียบร้อยแล้ว',
    deactivated: 'ปิดใช้งาน secret เรียบร้อยแล้ว',
    legacy_secret: 'Legacy secret',
    expired: 'หมดอายุแล้ว',
    expired_tooltip: 'secret นี้หมดอายุเมื่อ {{date}}',
    create_modal: {
      title: 'สร้าง secret ของแอปพลิเคชัน',
      expiration: 'วันหมดอายุ',
      expiration_description: 'secret จะหมดอายุเมื่อ {{date}}',
      expiration_description_never:
        'secret นี้จะไม่มีวันหมดอายุ แนะนำให้ตั้งวันหมดอายุเพื่อเพิ่มความปลอดภัย',
      days: '{{count}} วัน',
      days_other: '{{count}} วัน',
      years: '{{count}} ปี',
      years_other: '{{count}} ปี',
      created: 'สร้าง secret {{name}} เรียบร้อยแล้ว',
    },
    edit_modal: {
      title: 'แก้ไข secret แอปพลิเคชัน',
      edited: 'แก้ไข secret {{name}} เรียบร้อยแล้ว',
    },
  },
  saml_idp_config: {
    title: 'SAML IdP metadata',
    description:
      'ใช้ metadata และ certificate ด้านล่างนี้เพื่อตั้งค่า SAML IdP ในแอปพลิเคชันของคุณ',
    metadata_url_label: 'URL metadata ของ IdP',
    single_sign_on_service_url_label: 'URL บริการ single sign-on',
    idp_entity_id_label: 'IdP entity ID',
  },
  saml_idp_certificates: {
    title: 'SAML signing certificate',
    expires_at: 'หมดอายุเมื่อ',
    finger_print: 'ลายนิ้วมือ',
    status: 'สถานะ',
    active: 'ใช้งานอยู่',
    inactive: 'ไม่ได้ใช้งาน',
  },
  saml_idp_name_id_format: {
    title: 'รูปแบบ Name ID',
    description: 'เลือกรูปแบบ Name ID ของ SAML IdP',
    persistent: 'คงที่ (Persistent)',
    persistent_description: 'ใช้รหัสผู้ใช้ Logto เป็น Name ID',
    transient: 'ชั่วคราว (Transient)',
    transient_description: 'ใช้รหัสผู้ใช้ครั้งเดียวเป็น Name ID',
    unspecified: 'ไม่ระบุ',
    unspecified_description: 'ใช้รหัสผู้ใช้ Logto เป็น Name ID',
    email_address: 'อีเมล',
    email_address_description: 'ใช้อีเมลเป็น Name ID',
  },
  saml_encryption_config: {
    encrypt_assertion: 'เข้ารหัส SAML assertion',
    encrypt_assertion_description: 'เมื่อเปิดใช้งาน SAML assertion จะถูกเข้ารหัส',
    encrypt_then_sign: 'เข้ารหัสแล้วลงลายเซ็น',
    encrypt_then_sign_description:
      'เมื่อเปิดใช้งาน assertion SAML จะถูกเข้ารหัสก่อน แล้วจึงลงลายเซ็น หากไม่เปิดจะลงลายเซ็นก่อนแล้วจึงเข้ารหัส',
    certificate: 'ใบรับรอง (Certificate)',
    certificate_tooltip:
      'คัดลอกและวาง x509 certificate ที่ได้จาก service provider ของคุณเพื่อลงรหัส SAML assertion',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: 'จำเป็นต้องใส่ใบรับรอง (Certificate)',
    certificate_invalid_format_error:
      'รูปแบบ certificate ไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
  },
  saml_app_attribute_mapping: {
    name: 'Mapping ค่าคุณสมบัติ',
    title: 'Mapping ค่าคุณสมบัติพื้นฐาน',
    description: 'เพิ่ม mapping เพื่อ sync โปรไฟล์ผู้ใช้จาก Logto สู่แอปพลิเคชันของคุณ',
    col_logto_claims: 'ค่าของ Logto',
    col_sp_claims: 'ชื่อค่าของแอปของคุณ',
    add_button: 'เพิ่มอีกหนึ่งรายการ',
  },
};

export default Object.freeze(application_details);
