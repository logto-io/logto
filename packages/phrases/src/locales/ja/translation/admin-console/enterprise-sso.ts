const enterprise_sso = {
  page_title: 'エンタープライズSSO',
  title: 'エンタープライズSSO',
  subtitle:
    '企業のアイデンティティプロバイダーとの接続を可能にし、SP主導のシングルサインオンを有効にします。',
  create: 'エンタープライズコネクターを追加',
  col_connector_name: 'コネクター名',
  col_type: 'タイプ',
  col_email_domain: 'メールドメイン',
  col_status: 'ステータス',
  col_status_in_use: '使用中',
  col_status_invalid: '無効',
  placeholder_title: 'エンタープライズコネクター',
  placeholder_description:
    'Logtoは多くの組み込み企業向けアイデンティティプロバイダーを提供しており、同時に標準プロトコルで独自のプロバイダーを作成することもできます。',
  create_modal: {
    title: 'エンタープライズコネクターを追加',
    text_divider: 'または、標準プロトコルによってカスタマイズされたコネクターを作成できます。',
    connector_name_field_title: 'コネクター名',
    connector_name_field_placeholder: '企業向けアイデンティティプロバイダーの名前',
    create_button_text: 'コネクターを作成',
  },
};

export default Object.freeze(enterprise_sso);
