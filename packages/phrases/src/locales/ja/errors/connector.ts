const connector = {
  general: 'コネクタでエラーが発生しました：{{errorDescription}}',
  not_found: 'タイプ：{{type}}に利用可能なコネクタが見つかりません。',
  not_enabled: 'コネクタが有効ではありません。',
  invalid_metadata: 'コネクタのメタデータが無効です。',
  invalid_config_guard: 'コネクタの設定ガードが無効です。',
  unexpected_type: 'コネクタのタイプが予期しないものです。 ',
  invalid_request_parameters: 'リクエストに誤った入力パラメータが含まれています。',
  insufficient_request_parameters: 'リクエストには、入力パラメータが不足している可能性があります。',
  invalid_config: 'コネクタの設定が無効です。',
  invalid_response: 'コネクタのレスポンスが無効です。',
  template_not_found: 'コネクタ構成から正しいテンプレートを見つけることができませんでした。',
  not_implemented: '{{method}}：まだ実装されていません。',
  social_invalid_access_token: 'コネクタのアクセストークンが無効です。',
  invalid_auth_code: 'コネクタの認証コードが無効です。',
  social_invalid_id_token: 'コネクタのIDトークンが無効です。',
  authorization_failed: 'ユーザーの認証プロセスが失敗しました。',
  social_auth_code_invalid: 'アクセストークンを取得できません。承認コードを確認してください。',
  more_than_one_sms: 'SMSコネクタの数が1より大きいです。',
  more_than_one_email: '電子メールコネクタの数が1より大きいです。',
  more_than_one_connector_factory:
    '複数のコネクタファクトリ（ID：{{connectorIds}}）が見つかりました。必要のないものはアンインストールできます。',
  db_connector_type_mismatch: 'DBには、タイプに一致しないコネクタがあります。',
  not_found_with_connector_id: '指定された標準コネクタIDでコネクタを見つけることができません。',
  multiple_instances_not_supported: '選択した標準コネクタで複数のインスタンスを作成できません。',
  invalid_type_for_syncing_profile:
    'ソーシャルコネクタを使用してユーザープロファイルを同期できます。',
  can_not_modify_target: 'コネクタの「ターゲット」を変更できません。',
  should_specify_target: "'target'を指定する必要があります。",
  multiple_target_with_same_platform:
    '同じターゲットとプラットフォームを持つ複数のソーシャルコネクタを持つことはできません。',
  cannot_overwrite_metadata_for_non_standard_connector:
    'このコネクタの「メタデータ」は上書きできません。',
};

export default connector;
