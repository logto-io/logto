const enterprise_sso = {
  page_title: '企业单点登录',
  title: '企业单点登录',
  subtitle: '连接企业身份提供者并启用单点登录。',
  create: '添加企业连接器',
  col_connector_name: '连接器名称',
  col_type: '类型',
  col_email_domain: '电子邮件域',
  placeholder_title: '企业连接器',
  placeholder_description:
    'Logto 提供了许多内置的企业身份提供者，与之连接，与此同时你可以使用 SAML 和 OIDC 协议创建自己的企业身份提供者。',
  create_modal: {
    title: '添加企业连接器',
    text_divider: '或者你可以通过标准协议自定义你的连接器。',
    connector_name_field_title: '连接器名称',
    connector_name_field_placeholder: 'E.g., {corp. name} - {identity provider name}',
    create_button_text: '创建连接器',
  },
  guide: {
    subtitle: '连接企业身份提供者的逐步指南。',
    finish_button_text: '继续',
  },
  basic_info: {
    title: '在 IdP 中配置你的服务',
    description:
      '在 {{name}} 身份提供者中通过 SAML 2.0 创建一个新的应用集成。然后将以下值粘贴到其中。',
    saml: {
      acs_url_field_name: '断言消费者服务 URL（回复 URL）',
      audience_uri_field_name: '受众 URI (SP 实体 ID)',
      entity_id_field_name: '服务提供商 (SP) 实体 ID',
      entity_id_field_tooltip:
        'SP 实体 ID 可以采用任何字符串格式，通常使用 URI 或 URL 形式作为标识符，但这不是必需的。',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: '重定向 URI（回调 URL）',
      redirect_uri_field_description:
        'Redirect URI 是在 SSO 认证后用户被重定向到的地址。请将此 URI 添加到 IdP 的配置中。',
      redirect_uri_field_custom_domain_description:
        '如果你在 Logto 中使用多个<a>自定义域名</a>，务必将所有对应的回调 URI 都添加到 IdP 中，以确保 SSO 在每个域名上都能正常工作。\n\n默认的 Logto 域名 (*.logto.app) 始终有效，只有在你也希望支持该域名下的 SSO 时才需要包含它。',
    },
  },
  attribute_mapping: {
    title: '属性映射',
    description: '需要 `id` 和 `email` 来同步用户配置文件。在 IdP 中输入以下声明名称和值。',
    col_sp_claims: '服务提供商（Logto）的值',
    col_idp_claims: '身份提供者的声明名称',
    idp_claim_tooltip: '身份提供者的声明名称',
  },
  metadata: {
    title: '配置 IdP 元数据',
    description: '配置来自身份提供者的元数据',
    dropdown_trigger_text: '使用其他配置方法',
    dropdown_title: '选择你的配置方法',
    metadata_format_url: '输入元数据 URL',
    metadata_format_xml: '上传元数据 XML 文件',
    metadata_format_manual: '手动输入元数据详细信息',
    saml: {
      metadata_url_field_name: '元数据 URL',
      metadata_url_description: '动态地从元数据 URL 获取数据并更新证书。',
      metadata_xml_field_name: 'IdP 元数据 XML 文件',
      metadata_xml_uploader_text: '上传元数据 XML 文件',
      sign_in_endpoint_field_name: '登录 URL',
      idp_entity_id_field_name: 'IdP 实体 ID（发行者）',
      certificate_field_name: '签名证书',
      certificate_placeholder: '复制并粘贴 x509 证书',
      certificate_required: '需要签名证书。',
    },
    oidc: {
      client_id_field_name: '客户端 ID',
      client_secret_field_name: '客户端密钥',
      issuer_field_name: '发行者',
      scope_field_name: '范围',
      scope_field_placeholder: '输入范围（用空格分隔）',
    },
  },
};

export default Object.freeze(enterprise_sso);
