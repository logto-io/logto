const enterprise_sso = {
  page_title: 'エンタープライズSSO',
  title: 'エンタープライズSSO',
  subtitle: '企業のアイデンティティプロバイダーを接続し、シングルサインオンを有効にします。',
  create: 'エンタープライズコネクターを追加',
  col_connector_name: 'コネクター名',
  col_type: 'タイプ',
  col_email_domain: 'メールドメイン',
  placeholder_title: 'エンタープライズコネクター',
  placeholder_description:
    'Logtoは、多くの組み込みエンタープライズアイデンティティプロバイダーを提供しており、同時にSAMLおよびOIDCプロトコルを使用して独自のプロバイダーを作成できます。',
  create_modal: {
    title: 'エンタープライズコネクターを追加',
    text_divider: 'または、標準プロトコルによってカスタマイズされたコネクターを作成できます。',
    connector_name_field_title: 'コネクター名',
    connector_name_field_placeholder: 'E.g., {corp. name} - {identity provider name}',
    create_button_text: 'コネクターを作成',
  },
  guide: {
    subtitle: '企業アイデンティティプロバイダーとの接続の手順ガイド',
    finish_button_text: '続行',
  },
  basic_info: {
    title: 'IdPでサービスを構成',
    description:
      'IdPにてSAML 2.0の新しいアプリケーション連携を作成します。次に以下の値を貼り付けます。',
    saml: {
      acs_url_field_name: 'アサーションコンシューマサービスURL（応答URL）',
      audience_uri_field_name: 'オーディエンス URI (SP エンティティ ID)',
      entity_id_field_name: 'サービスプロバイダー (SP) エンティティ ID',
      entity_id_field_tooltip:
        'SP エンティティ ID は任意の文字列形式で指定可能で、通常は識別子として URI 形式または URL 形式を使用しますが、これに限定されません。',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'リダイレクトURI（コールバックURL）',
      redirect_uri_field_description:
        'Redirect URI は、SSO 認証の後にユーザーがリダイレクトされる場所です。この URI を IdP の設定に追加してください。',
      redirect_uri_field_custom_domain_description:
        'Logto で複数の<a>カスタムドメイン</a>を使用する場合は、すべての対応するコールバック URI を IdP に追加し、各ドメインで SSO が機能するようにしてください。\n\nLogto の既定ドメイン (*.logto.app) は常に有効です。そのドメインで SSO をサポートしたい場合にのみ含めてください。',
    },
  },
  attribute_mapping: {
    title: '属性マッピング',
    description:
      'IdPからのユーザープロファイル同期には`id`と`email`が必要です。次にIdPに以下のクレーム名と値を入力します。',
    col_sp_claims: 'サービスプロバイダー（Logto）の値',
    col_idp_claims: 'アイデンティティプロバイダーのクレーム名',
    idp_claim_tooltip: 'アイデンティティプロバイダーのクレーム名',
  },
  metadata: {
    title: 'IdPメタデータを構成',
    description: 'アイデンティティプロバイダーのメタデータを構成します',
    dropdown_trigger_text: '別の構成方法を使用する',
    dropdown_title: '構成方法を選択',
    metadata_format_url: 'メタデータURLを入力',
    metadata_format_xml: 'メタデータXMLファイルをアップロード',
    metadata_format_manual: 'メタデータの詳細を手動で入力',
    saml: {
      metadata_url_field_name: 'メタデータURL',
      metadata_url_description:
        'メタデータURLからデータを動的に取得し、証明書を最新の状態に保ちます。',
      metadata_xml_field_name: 'IdPメタデータXMLファイル',
      metadata_xml_uploader_text: 'メタデータXMLファイルをアップロード',
      sign_in_endpoint_field_name: 'サインオンURL',
      idp_entity_id_field_name: 'IdPエンティティID（発行者）',
      certificate_field_name: '署名証明書',
      certificate_placeholder: 'x509証明書をコピーして貼り付けてください',
      certificate_required: '署名証明書は必須です。',
    },
    oidc: {
      client_id_field_name: 'クライアントID',
      client_secret_field_name: 'クライアントシークレット',
      issuer_field_name: '発行者',
      scope_field_name: 'スコープ',
      scope_field_placeholder: 'スコープを入力してください（スペースで区切ってください）',
    },
  },
};

export default Object.freeze(enterprise_sso);
