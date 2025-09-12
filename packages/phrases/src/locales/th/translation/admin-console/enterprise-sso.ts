const enterprise_sso = {
  page_title: 'SSO สำหรับองค์กร',
  title: 'SSO สำหรับองค์กร',
  subtitle: 'เชื่อมต่อผู้ให้บริการระบุตัวตนขององค์กรและเปิดใช้งานการเข้าสู่ระบบครั้งเดียว',
  create: 'เพิ่มตัวเชื่อมต่อองค์กร',
  col_connector_name: 'ชื่อตัวเชื่อมต่อ',
  col_type: 'ประเภท',
  col_email_domain: 'โดเมนอีเมล',

  placeholder_title: 'ตัวเชื่อมต่อองค์กร',
  placeholder_description:
    'Logto มีผู้ให้บริการระบุตัวตนสำหรับองค์กรที่มีให้เลือกหลายตัวในระบบ คุณยังสามารถสร้างแบบของคุณเองด้วยโปรโตคอล SAML และ OIDC ได้',
  create_modal: {
    title: 'เพิ่มตัวเชื่อมต่อองค์กร',
    text_divider: 'หรือคุณสามารถปรับแต่งตัวเชื่อมต่อของคุณด้วยโปรโตคอลมาตรฐาน',
    connector_name_field_title: 'ชื่อตัวเชื่อมต่อ',
    connector_name_field_placeholder: 'เช่น {corp. name} - {identity provider name}',
    create_button_text: 'สร้างตัวเชื่อมต่อ',
  },
  guide: {
    subtitle: 'คู่มือเชื่อมต่อผู้ให้บริการระบุตัวตนขององค์กรแบบทีละขั้นตอน',
    finish_button_text: 'ดำเนินการต่อ',
  },
  basic_info: {
    title: 'กำหนดค่าบริการของคุณใน IdP',
    description:
      'สร้างการผสานแอปพลิเคชันใหม่ด้วย SAML 2.0 ในผู้ให้บริการระบุตัวตน {{name}} ของคุณ แล้ววางค่าต่อไปนี้ลงไป',
    saml: {
      acs_url_field_name: 'Assertion consumer service URL (Reply URL)',
      audience_uri_field_name: 'Audience URI (SP Entity ID)',
      entity_id_field_name: 'Service Provider (SP) Entity ID',
      entity_id_field_tooltip:
        'SP Entity ID สามารถอยู่ในรูปแบบ string ใดก็ได้ โดยปกติจะใช้เป็น URI หรือ URL เพื่อระบุ แต่ไม่จำเป็นต้องเป็นแบบนี้เสมอไป',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'Redirect URI (Callback URL)',
    },
  },
  attribute_mapping: {
    title: 'การแมปแอตทริบิวต์',
    description:
      '`id` และ `email` จำเป็นต้องใช้เพื่อซิงค์โปรไฟล์ผู้ใช้จาก IdP กรอกชื่อ claim และค่าต่อไปนี้ใน IdP ของคุณ',
    col_sp_claims: 'ค่าของ Service Provider (Logto)',
    col_idp_claims: 'ชื่อ claim ของ Identity Provider',
    idp_claim_tooltip: 'ชื่อ claim ของผู้ให้บริการระบุตัวตน',
  },
  metadata: {
    title: 'กำหนดค่า Metadata ของ IdP',
    description: 'กำหนดค่า metadata ที่มาจากผู้ให้บริการระบุตัวตน',
    dropdown_trigger_text: 'เลือกวิธีการกำหนดค่าอื่น',
    dropdown_title: 'เลือกวิธีกำหนดค่าของคุณ',
    metadata_format_url: 'ป้อน Metadata URL',
    metadata_format_xml: 'อัปโหลดไฟล์ Metadata XML',
    metadata_format_manual: 'ป้อนรายละเอียด Metadata ด้วยตนเอง',
    saml: {
      metadata_url_field_name: 'Metadata URL',
      metadata_url_description:
        'ดึงข้อมูลจาก Metadata URL อัตโนมัติและคอยอัพเดต certificate ให้ทันสมัย',
      metadata_xml_field_name: 'ไฟล์ Metadata XML ของ IdP',
      metadata_xml_uploader_text: 'อัพโหลดไฟล์ Metadata XML',
      sign_in_endpoint_field_name: 'Sign on URL',
      idp_entity_id_field_name: 'IdP entity ID (Issuer)',
      certificate_field_name: 'ใบรับรองการลงชื่อ (Signing certificate)',
      certificate_placeholder: 'คัดลอกและวางใบรับรอง x509',
      certificate_required: 'ต้องระบุใบรับรองการลงชื่อ',
    },
    oidc: {
      client_id_field_name: 'Client ID',
      client_secret_field_name: 'Client secret',
      issuer_field_name: 'Issuer',
      scope_field_name: 'ขอบเขต (Scope)',
      scope_field_placeholder: 'ป้อนค่า scope (คั่นด้วยช่องว่าง)',
    },
  },
};

export default Object.freeze(enterprise_sso);
