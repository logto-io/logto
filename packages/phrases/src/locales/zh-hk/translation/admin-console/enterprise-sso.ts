const enterprise_sso = {
  page_title: '企業單一登入 (SSO)',
  title: '企業單一登入 (SSO)',
  subtitle: '連接企業身份提供者並啟用服務提供者啟動的單一登入。',
  create: '新增企業連接器',
  col_connector_name: '連接器名稱',
  col_type: '類型',
  col_email_domain: '電子郵件域名',
  col_status: '狀態',
  col_status_in_use: '使用中',
  col_status_invalid: '無效',
  placeholder_title: '企業連接器',
  placeholder_description:
    'Logto已提供許多內建的企業身份提供者進行連接，同時您也可以通過標準協議創建自己的企業身份提供者。',
  create_modal: {
    title: '新增企業連接器',
    text_divider: '或者您可以通過標準協議自定義您的連接器。',
    connector_name_field_title: '連接器名稱',
    connector_name_field_placeholder: '企業身份提供者的名稱',
    create_button_text: '創建連接器',
  },
};

export default Object.freeze(enterprise_sso);
