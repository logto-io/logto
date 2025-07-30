const user_identity_details = {
  social_identity_page_title: 'ソーシャル ID 詳細',
  back_to_user_details: 'ユーザー詳細に戻る',
  delete_identity: `ID 接続を削除`,
  social_account: {
    title: 'ソーシャルアカウント',
    description:
      '連携された {{connectorName}} アカウントから同期されたユーザーデータとプロフィール情報を表示します。',
    provider_name: 'ソーシャル ID プロバイダー名',
    identity_id: 'ソーシャル ID',
    user_profile: 'ソーシャル ID プロバイダーから同期されたユーザープロフィール',
  },
  sso_account: {
    title: 'エンタープライズ SSO アカウント',
    description:
      '連携された {{connectorName}} アカウントから同期されたユーザーデータとプロフィール情報を表示します。',
    provider_name: 'エンタープライズ SSO ID プロバイダー名',
    identity_id: 'エンタープライズ SSO ID',
    user_profile: 'エンタープライズ SSO ID プロバイダーから同期されたユーザープロフィール',
  },
  token_storage: {
    title: 'アクセストークン',
    description:
      '{{connectorName}} のアクセストークンとリフレッシュトークンをシークレットボールトに保存します。繰り返しユーザーの同意を得ることなく、自動化された API 呼び出しを可能にします。',
  },
  access_token: {
    title: 'アクセストークン',
    description_active:
      'アクセストークンはアクティブであり、シークレットボールトに安全に保存されています。 あなたの製品はこれを使用して {{connectorName}} API にアクセスできます。',
    description_inactive:
      'このアクセストークンは無効です（例: 取り消されました）。 ユーザーは、機能を復元するためにアクセスを再認可する必要があります。',
    description_expired:
      'このアクセストークンは期限切れです。 プロセススは、次回のリフレッシュトークンを使用した API リクエストで自動的に更新されます。 リフレッシュトークンが利用できない場合は、ユーザー認証が再度必要になります。',
  },
  refresh_token: {
    available:
      'リフレッシュトークンが利用可能です。アクセストークンが期限切れになると、リフレッシュトークンを使用して自動的に更新されます。',
    not_available:
      'リフレッシュトークンが利用できません。アクセストークンが期限切れになると、ユーザーは新しいトークンを取得するために再認証する必要があります。',
  },
  token_status: 'トークンステータス',
  created_at: '作成日時',
  updated_at: '更新日時',
  expires_at: '有効期限日時',
  scopes: 'スコープ',
  delete_tokens: {
    title: 'トークンの削除',
    description:
      '保存されたトークンを削除します。ユーザーは、機能を復元するためにアクセスを再許可する必要があります。',
    confirmation_message:
      '本当にトークンを削除してもよろしいですか？ Logto シークレットボールトは、保存された {{connectorName}} アクセスおよびリフレッシュトークンを削除します。このユーザーは、{{connectorName}} API アクセスを復元するために再認可する必要があります。',
  },
  token_storage_disabled: {
    title: 'このコネクターのトークンストレージは無効です',
    description:
      'ユーザーは、現在、{{connectorName}} を使用してサインインしたり、アカウントをリンクしたり、各同意フロー中にプロファイルを同期したりすることしかできません。{{connectorName}} API にアクセスし、ユーザーの代理としてアクションを実行するには、でトークンストレージを有効にしてください。',
  },
};

export default Object.freeze(user_identity_details);
