const enterprise_sso = {
  page_title: '企業單一登入 (SSO)',
  title: '企業單一登入 (SSO)',
  subtitle: '連接企業身份提供者並啟用服務提供者啟動的單一登入。',
  create: '新增企業連接器',
  col_connector_name: '連接器名稱',
  col_type: '類型',
  col_email_domain: '電子郵件域名',
  placeholder_title: '企業連接器',
  placeholder_description:
    'Logto 提供了許多內置的企業身份提供者來連接，同時您可以使用 SAML 和 OIDC 協定創建自己的。',
  create_modal: {
    title: '新增企業連接器',
    text_divider: '或者您可以通過標準協議自定義您的連接器。',
    connector_name_field_title: '連接器名稱',
    connector_name_field_placeholder: '例如，{corp. name} - {identity provider name}',
    create_button_text: '創建連接器',
  },
  guide: {
    subtitle: '一個關於連接企業身份提供者的分步指南。',
    finish_button_text: '繼續',
  },
  basic_info: {
    title: '在 IdP 中配置您的服務',
    description: '在您的{{name}}身份提供者中通過 SAML 2.0 創建新應用集成。然後將以下值貼到其中。',
    saml: {
      acs_url_field_name: '斷言消費服務 URL (回複 URL)',
      audience_uri_field_name: '受眾 URI (SP 實體 ID)',
    },
    oidc: {
      redirect_uri_field_name: '重定向 URI（回調 URL）',
    },
  },
  attribute_mapping: {
    title: '屬性映射',
    description: '同步用戶概要從 IdP 需要 `id` 和 `email`。在您的 IdP 中輸入以下聲明名稱和值。',
    col_sp_claims: '服務提供者（Logto）的值',
    col_idp_claims: '身份提供者的聲明名稱',
    idp_claim_tooltip: '身份提供者的聲明名稱',
  },
  metadata: {
    title: '配置 IdP 元數據',
    description: '從身份提供者配置元數據',
    dropdown_trigger_text: '使用其他配置方法',
    dropdown_title: '選擇您的配置方法',
    metadata_format_url: '輸入元數據 URL',
    metadata_format_xml: '上傳元數據 XML 文件',
    metadata_format_manual: '手動輸入元數據細節',
    saml: {
      metadata_url_field_name: '元數據 URL',
      metadata_url_description: '動態從元數據 URL 檢索數據並保持證書最新。',
      metadata_xml_field_name: 'IdP 元數據 XML 文件',
      metadata_xml_uploader_text: '上傳元數據 XML 文件',
      sign_in_endpoint_field_name: '登錄 URL',
      idp_entity_id_field_name: 'IdP 實體 ID（發行者）',
      certificate_field_name: '簽名證書',
      certificate_placeholder: '複製並粘貼 x509 憑證',
      certificate_required: '需要簽名證書。',
    },
    oidc: {
      client_id_field_name: '客戶端 ID',
      client_secret_field_name: '客戶端密鑰',
      issuer_field_name: '發行者',
      scope_field_name: '範圍',
    },
  },
};

export default Object.freeze(enterprise_sso);
