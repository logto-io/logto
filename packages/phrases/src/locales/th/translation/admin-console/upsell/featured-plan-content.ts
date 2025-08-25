const featured_plan_content = {
  mau: {
    free_plan: 'สูงสุด {{count, number}} MAU',
    pro_plan: 'MAU ไม่จำกัด',
  },
  m2m: {
    free_plan: '{{count, number}} เครื่องต่อเครื่อง',
    pro_plan: 'เครื่องต่อเครื่องเพิ่มเติม',
  },
  saml_and_third_party_apps: 'แอป SAML & แอปของบุคคลที่สาม',
  third_party_apps: 'IdP สำหรับแอปพลิเคชันของบุคคลที่สาม',
  mfa: 'การยืนยันตัวตนแบบหลายปัจจัย',
  sso: 'SSO สำหรับองค์กร',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} บทบาท และ {{permissionCount, number}} สิทธิ์ ต่อบทบาท',
    pro_plan: 'บทบาทและสิทธิ์ต่อบทบาทไม่จำกัด',
  },
  rbac: 'การควบคุมการเข้าถึงตามบทบาท',
  organizations: 'องค์กร',
  audit_logs: 'การเก็บบันทึกการตรวจสอบ: {{count, number}} วัน',
};

export default Object.freeze(featured_plan_content);
