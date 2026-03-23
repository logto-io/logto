const oidc_configs = {
  sessions_card_title: 'Logto 会话',
  sessions_card_description:
    '自定义由 Logto 授权服务器存储的会话策略。它会记录用户的全局认证状态，以启用 SSO 并支持跨应用静默重新认证。',
  session_max_ttl_in_days: '会话最大生存时间（TTL，天）',
  session_max_ttl_in_days_tip:
    '从会话创建时开始计算的绝对生命周期上限。无论是否有活动，会话都会在该固定时长到期后结束。',
  oss_notice:
    '对于 Logto OSS，更新任何 OIDC 配置（包括会话配置和<keyRotationsLink>密钥轮换</keyRotationsLink>）后，都需要重启实例才能生效。若要在不重载服务的情况下自动应用所有 OIDC 配置更新，请<centralCacheLink>启用中央缓存</centralCacheLink>。',
};

export default Object.freeze(oidc_configs);
