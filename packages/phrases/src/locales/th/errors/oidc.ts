const oidc = {
  aborted: 'ผู้ใช้ยกเลิกการโต้ตอบแล้ว',
  invalid_scope: 'ขอบเขตไม่ถูกต้อง: {{error_description}}',
  invalid_token: 'โทเค็นไม่ถูกต้อง',
  invalid_client_metadata: 'ข้อมูลเมทาดาท่าของไคลเอนต์ไม่ถูกต้อง',
  insufficient_scope: 'โทเค็นไม่มีขอบเขต `{{scope}}`',
  invalid_request: 'คำขอไม่ถูกต้อง',
  invalid_grant: 'คำขอให้สิทธิ์ไม่ถูกต้อง',
  invalid_issuer: 'ผู้ออกไม่ถูกต้อง',
  invalid_redirect_uri: '`redirect_uri` ไม่ตรงกับ `redirect_uris` ที่ลงทะเบียนไว้ของไคลเอนต์',
  access_denied: 'ปฏิเสธการเข้าถึง',
  invalid_target: 'ตัวระบุทรัพยากรไม่ถูกต้อง',
  unsupported_grant_type: 'ไม่รองรับ `grant_type` ที่ร้องขอ',
  unsupported_response_mode: 'ไม่รองรับ `response_mode` ที่ร้องขอ',
  unsupported_response_type: 'ไม่รองรับ `response_type` ที่ร้องขอ',
  /** @deprecated Use {@link oidc.server_error} or {@link oidc.provider_error_fallback} instead. */
  provider_error: 'เกิดข้อผิดพลาดภายใน OIDC: {{message}}',
  server_error: 'เกิดข้อผิดพลาด OIDC ที่ไม่ทราบสาเหตุ กรุณาลองใหม่ภายหลัง',
  provider_error_fallback: 'เกิดข้อผิดพลาด OIDC: {{code}}',
  key_required: 'ต้องมีคีย์อย่างน้อยหนึ่งอัน',
  key_not_found: 'ไม่พบคีย์ที่มีรหัส {{id}}',
};

export default Object.freeze(oidc);
