const usage = {
  status_active: 'กำลังใช้งาน',
  status_inactive: 'ไม่ได้ใช้งาน',
  limited_status_quota_description: '(รวม {{quota}} แรกแล้ว)',
  unlimited_status_quota_description: '(รวมอยู่แล้ว)',
  disabled_status_quota_description: '(ไม่รวมอยู่)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (ไม่จำกัด)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (รวม {{basicQuota}} แรกแล้ว)</span>',
  usage_description_without_quota: '{{usage}}<span> (ไม่รวมอยู่)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU หมายถึงผู้ใช้ที่ไม่ซ้ำกันซึ่งได้แลกเปลี่ยนโทเคนอย่างน้อยหนึ่งครั้งกับ Logto ในรอบบิล ไม่จำกัดสำหรับแผน Pro <a>เรียนรู้เพิ่มเติม</a>',
    tooltip_for_enterprise:
      'MAU หมายถึงผู้ใช้ที่ไม่ซ้ำกันซึ่งได้แลกเปลี่ยนโทเคนอย่างน้อยหนึ่งครั้งกับ Logto ในรอบบิล ไม่จำกัดสำหรับแผน Enterprise',
  },
  organizations: {
    title: 'องค์กร',
    tooltip:
      'ฟีเจอร์เสริมเก็บค่าบริการคงที่ ${{price, number}} ต่อเดือน จำนวนและการใช้งานขององค์กรจะไม่ส่งผลต่อราคา',
    description_for_enterprise: '(รวมอยู่แล้ว)',
    tooltip_for_enterprise:
      'การรวมฟีเจอร์ขึ้นอยู่กับแผนของคุณ หากฟีเจอร์องค์กรไม่ได้อยู่ในสัญญาเริ่มต้น จะถูกคิดค่าใช้จ่ายเมื่อมีการเปิดใช้งาน Add-on นี้ราคา ${{price, number}}/เดือน ไม่ขึ้นกับจำนวนองค์กรหรือการใช้งาน',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'แผนของคุณรวมองค์กรจำนวน {{basicQuota}} แรกโดยไม่มีค่าใช้จ่าย หากต้องการมากกว่านั้น สามารถเพิ่มได้โดยซื้อ Add-on ฟีเจอร์องค์กรในราคา ${{price, number}} ต่อเดือน ไม่ขึ้นกับจำนวนหรือการใช้งานขององค์กร',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'ฟีเจอร์เสริมเก็บค่าบริการคงที่ ${{price, number}} ต่อเดือน จำนวนวิธีการยืนยันตัวตนที่ใช้จะไม่ส่งผลต่อราคา',
    tooltip_for_enterprise:
      'การรวมฟีเจอร์ขึ้นอยู่กับแผนของคุณ หาก MFA ไม่ได้อยู่ในสัญญาเริ่มต้น จะมีการคิดค่าใช้จ่ายเมื่อเปิดใช้งาน Add-on นี้ราคา ${{price, number}}/เดือน ไม่ขึ้นกับจำนวนวิธีการยืนยันตัวตนที่ใช้',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    tooltip: 'ฟีเจอร์เสริมราคา ${{price, number}} ต่อการเชื่อมต่อ SSO ต่อเดือน',
    tooltip_for_enterprise:
      'ฟีเจอร์เสริมราคา ${{price, number}} ต่อการเชื่อมต่อ SSO ต่อเดือน {{basicQuota}} การเชื่อมต่อ SSO แรกฟรีและรวมอยู่ในแผนตามสัญญาของคุณ',
  },
  api_resources: {
    title: 'API resource',
    tooltip:
      'ฟีเจอร์เสริมราคา ${{price, number}} ต่อ resource ต่อเดือน โดย resource API 3 ตัวแรกฟรี',
    tooltip_for_enterprise:
      '{{basicQuota}} API resource แรก ฟรีและสามารถใช้งานได้ในแผนตามสัญญาของคุณ หากต้องการมากกว่านั้นราคา ${{price, number}} ต่อ resource ต่อเดือน',
  },
  machine_to_machine: {
    title: 'Machine-to-machine',
    tooltip:
      'ฟีเจอร์เสริมราคา ${{price, number}} ต่อแอปต่อเดือน โดย machine-to-machine app ตัวแรกรวมอยู่แล้ว',
    tooltip_for_enterprise:
      'machine-to-machine app ตัวแรก {{basicQuota}} รายฟรีในแผนตามสัญญาของคุณ หากต้องการเพิ่มเติมราคา ${{price, number}} ต่อแอปต่อเดือน',
  },
  tenant_members: {
    title: 'สมาชิกผู้เช่า',
    tooltip: 'ฟีเจอร์เสริมราคา ${{price, number}} ต่อสมาชิกต่อเดือน สมาชิก {{basicQuota}} แรกฟรี',
    tooltip_for_enterprise:
      'สมาชิกผู้เช่า {{basicQuota}} แรก รวมอยู่และใช้งานฟรีในแผนตามสัญญาของคุณ หากมากกว่านั้น ราคา ${{price, number}} ต่อสมาชิกต่อเดือน',
  },
  tokens: {
    title: 'โทเคน',
    tooltip:
      'ฟีเจอร์เสริมราคา ${{price, number}} ต่อ {{tokenLimit}} โทเคน โทเคน {{basicQuota}} แรก รวมอยู่ในแผน',
    tooltip_for_enterprise:
      'โทเคน {{basicQuota}} แรก รวมอยู่และใช้งานฟรีในแผนตามสัญญาของคุณ หากต้องการมากขึ้น ราคา ${{price, number}} ต่อ {{tokenLimit}} โทเคนต่อเดือน',
  },
  hooks: {
    title: 'Hook',
    tooltip: 'ฟีเจอร์เสริมราคา ${{price, number}} ต่อ hook โดย 10 hook แรก รวมอยู่ด้วย',
    tooltip_for_enterprise:
      'hook {{basicQuota}} แรก รวมอยู่และใช้งานฟรีในแผนตามสัญญาของคุณ หากมากกว่านั้น ราคา ${{price, number}} ต่อ hook ต่อเดือน',
  },
  security_features: {
    title: 'ความปลอดภัยขั้นสูง',
    tooltip:
      'ฟีเจอร์เสริมราคา ${{price, number}}/เดือน สำหรับแพ็กเกจความปลอดภัยขั้นสูง ซึ่งรวมถึง CAPTCHA, การล็อกเอาต์ด้วยรหัส, บล็อกอีเมล (เร็ว ๆ นี้) และอื่น ๆ',
  },
  saml_applications: {
    title: 'แอป SAML',
    tooltip: 'ฟีเจอร์เสริมราคา ${{price, number}} ต่อแอป SAML ต่อเดือน',
  },
  third_party_applications: {
    title: 'แอปของบุคคลที่สาม',
    tooltip: 'ฟีเจอร์เสริมราคา ${{price, number}} ต่อแอปต่อเดือน',
  },
  rbacEnabled: {
    title: 'บทบาท',
    tooltip:
      'ฟีเจอร์เสริมเก็บค่าบริการคงที่ ${{price, number}} ต่อเดือน จำนวนบทบาทรวมจะไม่ส่งผลต่อราคา',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'หากคุณมีการเปลี่ยนแปลงฟีเจอร์เสริมในรอบบิลปัจจุบัน บิลถัดไปของคุณอาจสูงขึ้นเล็กน้อยสำหรับเดือนแรกหลังจากมีการเปลี่ยนแปลง โดยคิดราคาเริ่มต้น ${{price, number}} บวกกับค่าใช้จ่ายฟีเจอร์เสริมที่ยังไม่ได้ชำระสำหรับรอบปัจจุบันและยอดเต็มสำหรับรอบถัดไป <a>เรียนรู้เพิ่มเติม</a>',
  },
};

export default Object.freeze(usage);
