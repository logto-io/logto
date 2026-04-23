const oidc_configs = {
  sessions_card_title: 'Logto セッション',
  sessions_card_description:
    'Logto 認可サーバーに保存されるセッションポリシーをカスタマイズします。ユーザーのグローバル認証状態を記録し、SSO を有効化してアプリ間でのサイレント再認証を可能にします。',
  session_max_ttl_in_days: 'セッションの最大有効期間（TTL、日）',
  session_max_ttl_in_days_tip:
    'セッション作成時点からの絶対的な有効期限です。アクティビティの有無にかかわらず、この固定期間が経過するとセッションは終了します。',
  oss_notice:
    'Logto OSS では、OIDC 設定（セッション設定や<keyRotationsLink>キーのローテーション</keyRotationsLink>を含む）を更新した後、変更を反映するためにインスタンスの再起動が必要です。サービスを再起動せずにすべての OIDC 設定更新を自動適用するには、<centralCacheLink>セントラルキャッシュを有効にしてください</centralCacheLink>。',
  cloud_private_key_rotation_notice:
    'Logto Cloud では、プライベートキーのローテーションは 4 時間の猶予期間後に有効になります。',
};

export default Object.freeze(oidc_configs);
