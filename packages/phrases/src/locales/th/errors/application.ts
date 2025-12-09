const application = {
  invalid_type: 'เฉพาะแอปพลิเคชัน machine to machine เท่านั้นที่สามารถมีบทบาทที่เกี่ยวข้องได้',
  role_exists: 'รหัสบทบาท {{roleId}} ได้ถูกเพิ่มเข้าแอปพลิเคชันนี้แล้ว',
  invalid_role_type: 'ไม่สามารถกำหนดบทบาทประเภทผู้ใช้ให้กับแอปพลิเคชัน machine to machine ได้',
  invalid_third_party_application_type:
    'เฉพาะแอปพลิเคชันเว็บแบบเดิมเท่านั้นที่สามารถถูกระบุว่าเป็นแอปของบุคคลที่สาม',
  third_party_application_only: 'ฟีเจอร์นี้ใช้ได้เฉพาะกับแอปพลิเคชันบุคคลที่สามเท่านั้น',
  user_consent_scopes_not_found: 'พบขอบเขตการยินยอมของผู้ใช้ไม่ถูกต้อง',
  consent_management_api_scopes_not_allowed: 'ไม่อนุญาตให้ใช้ขอบเขต Management API',
  protected_app_metadata_is_required: 'ต้องระบุข้อมูล metadata ของแอปที่ได้รับการป้องกัน',
  protected_app_not_configured:
    'ยังไม่ได้ตั้งค่าผู้ให้บริการแอปที่ได้รับการป้องกัน ฟีเจอร์นี้ไม่พร้อมใช้งานสำหรับเวอร์ชันโอเพนซอร์ซ',
  cloudflare_unknown_error: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุขณะขอข้อมูลจาก Cloudflare API',
  protected_application_only: 'ฟีเจอร์นี้ใช้ได้เฉพาะกับแอปพลิเคชันที่ได้รับการป้องกันเท่านั้น',
  protected_application_misconfigured: 'ตั้งค่าแอปพลิเคชันที่ได้รับการป้องกันไม่ถูกต้อง',
  protected_application_subdomain_exists: 'ซับโดเมนของแอปพลิเคชันที่ได้รับการป้องกันถูกใช้งานแล้ว',
  invalid_subdomain: 'ซับโดเมนไม่ถูกต้อง',
  custom_domain_not_found: 'ไม่พบโดเมนแบบกำหนดเอง',
  should_delete_custom_domains_first: 'โปรดลบโดเมนแบบกำหนดเองออกก่อน',
  no_legacy_secret_found: 'แอปพลิเคชันนี้ไม่มี secret แบบเดิม',
  secret_name_exists: 'ชื่อ secret นี้มีอยู่แล้ว',
  saml: {
    use_saml_app_api: 'ใช้ `[METHOD] /saml-applications(/.*)?` API เพื่อใช้งาน SAML app',
    saml_application_only: 'API นี้ใช้ได้กับแอป SAML เท่านั้น',
    reach_oss_limit: 'คุณไม่สามารถสร้าง SAML แอปเพิ่มเติมได้ เนื่องจากถึงขีดจำกัด {{limit}} แล้ว',
    acs_url_binding_not_supported:
      'รองรับเฉพาะ HTTP-POST binding สำหรับรับ SAML assertion เท่านั้น',
    can_not_delete_active_secret: 'ไม่สามารถลบ secret ที่ถูกใช้งานอยู่ได้',
    no_active_secret: 'ไม่พบ secret ที่ถูกใช้งานอยู่',
    entity_id_required: 'ต้องระบุ Entity ID เพื่อสร้าง metadata',
    name_id_format_required: 'ต้องระบุรูปแบบ Name ID',
    unsupported_name_id_format: 'ไม่รองรับรูปแบบ Name ID นี้',
    missing_email_address: 'ผู้ใช้ไม่มีที่อยู่อีเมล',
    email_address_unverified: 'ที่อยู่อีเมลของผู้ใช้ยังไม่ได้รับการยืนยัน',
    invalid_certificate_pem_format: 'รูปแบบ certificate PEM ไม่ถูกต้อง',
    acs_url_required: 'ต้องระบุ Assertion Consumer Service URL',
    private_key_required: 'ต้องระบุ private key',
    certificate_required: 'ต้องระบุ certificate',
    invalid_saml_request: 'คำขอรับรองความถูกต้อง SAML ไม่ถูกต้อง',
    auth_request_issuer_not_match:
      'Issuer ของคำขอรับรองความถูกต้อง SAML ไม่ตรงกับ Service provider entity ID',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'ไม่พบ SAML SSO session ID ที่ถูกเริ่มต้นโดย service provider ในคุกกี้',
    sp_initiated_saml_sso_session_not_found:
      'ไม่พบ SAML SSO session ที่ถูกเริ่มต้นโดย service provider',
    state_mismatch: '`state` ไม่ตรงกัน',
  },
};

export default Object.freeze(application);
