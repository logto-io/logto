const enterprise_sso = {
  page_title: '企业单点登录',
  title: '企业单点登录',
  subtitle: '连接企业身份提供者并启用SP启动的单点登录。',
  create: '添加企业连接器',
  col_connector_name: '连接器名称',
  col_type: '类型',
  col_email_domain: '电子邮件域',
  placeholder_title: '企业连接器',
  placeholder_description:
    'Logto提供了许多内置的企业身份提供者，与之连接，与此同时您可以使用SAML和OIDC协议创建自己的企业身份提供者。',
  create_modal: {
    title: '添加企业连接器',
    text_divider: '或者您可以通过标准协议自定义您的连接器。',
    connector_name_field_title: '连接器名称',
    connector_name_field_placeholder: 'E.g., {corp. name} - {identity provider name}',
    create_button_text: '创建连接器',
  },
  guide: {
    subtitle: '连接企业身份提供者的逐步指南。',
    finish_button_text: '继续',
  },
  basic_info: {
    title: '在IdP中配置您的服务',
    description: '在{{name}}身份提供者中通过SAML 2.0创建一个新的应用集成。然后将以下值粘贴到其中。',
    saml: {
      acs_url_field_name: '断言消费者服务URL（回复URL）',
      audience_uri_field_name: '受众URI（SP实体ID）',
    },
    oidc: {
      redirect_uri_field_name: '重定向URI（回调URL）',
    },
  },
  attribute_mapping: {
    title: '属性映射',
    description: '需要`id`和`email`来同步用户配置文件。在IdP中输入以下声明名称和值。',
    col_sp_claims: '服务提供商（Logto）的值',
    col_idp_claims: '身份提供者的声明名称',
    idp_claim_tooltip: '身份提供者的声明名称',
  },
  metadata: {
    title: '配置IdP元数据',
    description: '配置来自身份提供者的元数据',
    dropdown_trigger_text: '使用其他配置方法',
    dropdown_title: '选择您的配置方法',
    metadata_format_url: '输入元数据URL',
    metadata_format_xml: '上传元数据XML文件',
    metadata_format_manual: '手动输入元数据详细信息',
    saml: {
      metadata_url_field_name: '元数据URL',
      metadata_url_description: '动态地从元数据URL获取数据并更新证书。',
      metadata_xml_field_name: 'IdP元数据XML文件',
      metadata_xml_uploader_text: '上传元数据XML文件',
      sign_in_endpoint_field_name: '登录URL',
      idp_entity_id_field_name: 'IdP实体ID（发行者）',
      certificate_field_name: '签名证书',
      certificate_placeholder: '复制并粘贴x509证书',
      certificate_required: '需要签名证书。',
    },
    oidc: {
      client_id_field_name: '客户端ID',
      client_secret_field_name: '客户端密钥',
      issuer_field_name: '发行者',
      scope_field_name: '范围',
    },
  },
};

export default Object.freeze(enterprise_sso);
