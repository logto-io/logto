const enterprise_sso = {
  page_title: '企业单点登录',
  title: '企业单点登录',
  subtitle: '连接企业身份提供者并启用SP启动的单点登录。',
  create: '添加企业连接器',
  col_connector_name: '连接器名称',
  col_type: '类型',
  col_email_domain: '电子邮件域',
  col_status: '状态',
  col_status_in_use: '正在使用',
  col_status_invalid: '无效',
  placeholder_title: '企业连接器',
  placeholder_description:
    'Logto已提供许多内置的企业身份提供者来连接，同时您可以使用标准协议创建您自己的提供者。',
  create_modal: {
    title: '添加企业连接器',
    text_divider: '或者您可以通过标准协议自定义您的连接器。',
    connector_name_field_title: '连接器名称',
    connector_name_field_placeholder: '企业身份提供者的名称',
    create_button_text: '创建连接器',
  },
  guide: {
    subtitle: '连接企业身份提供者的分步指南',
    finish_button_text: '继续',
  },
  basic_info: {
    title: '在 IdP 中配置您的服务',
    description:
      '在您的 {{name}} 身份提供者中创建一个 SAML 2.0 的新应用集成。 然后将以下值粘贴到它。',
    saml: {
      acs_url_field_name: 'Assertion consumer service URL (Reply URL)',
      audience_uri_field_name: 'Audience URI (SP Entity ID)',
    },
    oidc: {
      redirect_uri_field_name: '重定向 URI (回调 URL)',
    },
  },
  attribute_mapping: {
    title: '属性映射',
    description:
      '`id` 和 `email` 是同步用户配置文件来自 IdP 的所需信息。 在您的 IdP 中输入以下声明名称和值。',
    col_sp_claims: 'Logto 的声明名称',
    col_idp_claims: '身份提供者的声明名称',
    idp_claim_tooltip: '身份提供者的声明名称',
  },
  metadata: {
    title: '配置 IdP 元数据',
    description: '从身份提供者配置元数据',
    dropdown_trigger_text: '使用另一种配置方法',
    dropdown_title: '选择您的配置方法',
    metadata_format_url: '输入元数据网址',
    metadata_format_xml: '上传元数据 XML 文件',
    metadata_format_manual: '手动输入元数据详情',
    saml: {
      metadata_url_field_name: '元数据网址',
      metadata_url_description: '动态获取元数据网址的数据并保持证书最新。',
      metadata_xml_field_name: '元数据 XML 文件',
      metadata_xml_uploader_text: '上传元数据 XML 文件',
      sign_in_endpoint_field_name: '登录 URL',
      idp_entity_id_field_name: 'IdP 实体标识 (发行者)',
      certificate_field_name: '签名证书',
      certificate_placeholder: '复制并粘贴 x509 证书',
    },
    oidc: {
      client_id_field_name: '客户端 ID',
      client_secret_field_name: '客户端密钥',
      issuer_field_name: '发行者',
      scope_field_name: '范围',
    },
  },
};

export default Object.freeze(enterprise_sso);
