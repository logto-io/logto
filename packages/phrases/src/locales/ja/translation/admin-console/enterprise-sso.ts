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
  guide: {
    subtitle: '企業のアイデンティティプロバイダーを接続する手順案内。',
    finish_button_text: '続ける',
  },
  basic_info: {
    title: 'IdPでサービスを構成',
    description:
      'SAML 2.0で{{name}}アイデンティティプロバイダーに新しいアプリケーション統合を作成します。その後、以下の値を貼り付けます。',
    saml: {
      acs_url_field_name: 'アサーションコンシューマーサービスURL (返信URL)',
      audience_uri_field_name: 'オーディエンスURI (SPエンティティID)',
    },
    oidc: {
      redirect_uri_field_name: 'リダイレクトURI (コールバックURL)',
    },
  },
  attribute_mapping: {
    title: '属性マッピング',
    description:
      '`id`と`email`はIdPからユーザープロファイルを同期するために必要です。IdPに以下のクレーム名と値を入力してください。',
    col_sp_claims: 'Logtoのクレーム名',
    col_idp_claims: 'アイデンティティプロバイダーのクレーム名',
    idp_claim_tooltip: 'アイデンティティプロバイダーのクレーム名',
  },
  metadata: {
    title: 'IdPメタデータの構成',
    description: 'アイデンティティプロバイダーからメタデータを構成します',
    dropdown_trigger_text: '別の構成方法を使用',
    dropdown_title: '構成方法を選択',
    metadata_format_url: 'メタデータURLを入力',
    metadata_format_xml: 'メタデータXMLファイルをアップロード',
    metadata_format_manual: 'メタデータ詳細を手動で入力',
    saml: {
      metadata_url_field_name: 'メタデータURL',
      metadata_url_description:
        'メタデータURLからデータを動的に取得し、証明書を最新のものに保ちます。',
      metadata_xml_field_name: 'メタデータXMLファイル',
      metadata_xml_uploader_text: 'メタデータXMLファイルをアップロード',
      sign_in_endpoint_field_name: 'サインオンURL',
      idp_entity_id_field_name: 'IdPエンティティID (発行者)',
      certificate_field_name: '署名証明書',
      certificate_placeholder: 'x509証明書をコピーして貼り付け',
    },
    oidc: {
      client_id_field_name: 'クライアントID',
      client_secret_field_name: 'クライアントシークレット',
      issuer_field_name: '発行者',
      scope_field_name: 'スコープ',
    },
  },
};

export default Object.freeze(enterprise_sso);
