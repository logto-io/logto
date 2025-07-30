const enterprise_sso = {
  page_title: '企業單一登入',
  title: '企業單一登入',
  subtitle: '連接企業身份提供者並啟用單一登入。',
  create: '新增企業連接器',
  col_connector_name: '連接器名稱',
  col_type: '類型',
  col_email_domain: '電子郵件域',
  placeholder_title: '企業連接器',
  placeholder_description:
    'Logto 提供了許多內置的企業身份提供者，同時你也可以使用 SAML 和 OIDC 協議自定義自己的連接器。',
  create_modal: {
    title: '新增企業連接器',
    text_divider: '或者你可以按照標準協議自定義你的連接器。',
    connector_name_field_title: '連接器名稱',
    connector_name_field_placeholder: '例如，{企業名稱} - {身份提供者名稱}',
    create_button_text: '創建連接器',
  },
  guide: {
    subtitle: '一個逐步指南，連接企業身份提供者。',
    finish_button_text: '繼續',
  },
  basic_info: {
    title: '在 IdP 中配置您的服務',
    description:
      '在您的 {{name}} 身份提供者中使用 SAML 2.0 建立新的應用集成。然後將以下值粘貼到其中。',
    saml: {
      acs_url_field_name: '斷言消費服務 URL（回覆 URL）',
      audience_uri_field_name: '受眾 URI（SP 實體 ID）',
      entity_id_field_name: '服務提供者（SP）實體 ID',
      entity_id_field_tooltip:
        'SP 實體 ID 可以是任何字符串格式，通常使用 URI 或 URL 形式作為標識符，但這並不是強制的。',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: '重定向 URI（回撥 URL）',
    },
  },
  attribute_mapping: {
    title: '屬性映射',
    description: '需要`id`和`email`來同步用戶檔案從 IdP。 在您的 IdP 中輸入以下聲明名稱和值。',
    col_sp_claims: '服務提供者（Logto）的值',
    col_idp_claims: '身份提供者的聲明名稱',
    idp_claim_tooltip: '身份提供者的聲明名稱',
  },
  metadata: {
    title: '配置 IdP 元數據',
    description: '從身份提供者配置元數據',
    dropdown_trigger_text: '使用其他配置方法',
    dropdown_title: '選擇你的配置方法',
    metadata_format_url: '輸入元數據 URL',
    metadata_format_xml: '上傳元數據 XML 檔案',
    metadata_format_manual: '手動輸入元數據細節',
    saml: {
      metadata_url_field_name: '元數據 URL',
      metadata_url_description: '動態從元數據 URL 中獲取數據並保持憑證最新。',
      metadata_xml_field_name: 'IdP 元數據 XML 檔案',
      metadata_xml_uploader_text: '上傳元數據 XML 檔案',
      sign_in_endpoint_field_name: '登錄 URL',
      idp_entity_id_field_name: 'IdP 實體 ID（發行者）',
      certificate_field_name: '簽名憑證',
      certificate_placeholder: '複製並粘貼 x509 憑證',
      certificate_required: '簽名憑證是必需的。',
    },
    oidc: {
      client_id_field_name: '客戶端 ID',
      client_secret_field_name: '客戶端密鑰',
      issuer_field_name: '發行者',
      scope_field_name: '範圍',
      scope_field_placeholder: '輸入範圍（用空格分隔）',
    },
  },
};

export default Object.freeze(enterprise_sso);
