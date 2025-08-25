const usage = {
  status_active: '使用中',
  status_inactive: '未使用',
  limited_status_quota_description: '（最初の {{quota}} が含まれています）',
  unlimited_status_quota_description: '（含まれています）',
  disabled_status_quota_description: '（含まれていません）',
  usage_description_with_unlimited_quota: '{{usage}}<span>（無制限）</span>',
  usage_description_with_limited_quota:
    '{{usage}}<span>（最初の {{basicQuota}} が含まれています）</span>',
  usage_description_without_quota: '{{usage}}<span>（含まれていません）</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU は、請求サイクル内で Logto と少なくとも 1 つのトークンを交換したユニーク ユーザーです。Pro プランでは無制限です。<a>さらに詳しく</a>',
    tooltip_for_enterprise:
      'MAU は、請求サイクル内で Logto と少なくとも 1 つのトークンを交換したユニーク ユーザーです。エンタープライズ プランでは無制限です。',
  },
  organizations: {
    title: '組織',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルの固定料金です。組織の数や活動レベルには影響されません。',
    description_for_enterprise: '（含まれています）',
    tooltip_for_enterprise:
      '含有量はあなたのプランに依存します。組織機能が最初の契約に含まれていない場合、有効化した際に請求に追加されます。アドオンには、組織の数や活動とは無関係に、月額 {{price, number}} ドルの料金がかかります。',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'あなたのプランには最初の {{basicQuota}} の組織が無料で含まれています。より多くが必要な場合は、組織アドオンを追加し、組織の数や活動レベルに関わらず、月額 {{price, number}} ドルの固定料金がかかります。',
  },
  mfa: {
    title: '多要素認証',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルの固定料金です。使用する認証要素の数には影響されません。',
    tooltip_for_enterprise:
      '含有量はあなたのプランに依存します。MFA 機能が最初の契約に含まれていない場合、有効化した際に請求に追加されます。アドオンには、使用する認証要素の数に関係なく、月額 {{price, number}} ドルの料金がかかります。',
  },
  enterprise_sso: {
    title: 'エンタープライズ SSO',
    tooltip: '追加機能として、月額 {{price, number}} ドルの SSO 接続ごとの料金です。',
    tooltip_for_enterprise:
      'アドオン機能で、月額 {{price, number}} ドルの SSO 接続ごとの料金です。最初の {{basicQuota}} の SSO は契約ベースのプランで含まれており、無料で使用できます。',
  },
  api_resources: {
    title: 'API リソース',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルのリソースごとの料金です。最初の 3 つの API リソースは無料です。',
    tooltip_for_enterprise:
      '最初の {{basicQuota}} の API リソースは契約ベースのプランで含まれており、無料で使用できます。より多くが必要な場合、月額 {{price, number}} ドルのリソースごとの料金がかかります。',
  },
  machine_to_machine: {
    title: 'マシン対マシン',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルのアプリごとの料金です。最初のマシン対マシン アプリは無料です。',
    tooltip_for_enterprise:
      '最初の {{basicQuota}} のマシン対マシン アプリは契約ベースのプランで無料で使用できます。より多くが必要な場合、月額 {{price, number}} ドルのアプリごとの料金がかかります。',
  },
  tenant_members: {
    title: 'テナントメンバー',
    tooltip:
      '追加機能は、月額 {{price, number}} ドル、メンバーごとの価格です。最初の {{count}} テナントメンバーは無料です。',
    tooltip_one:
      '追加機能は月額 {{price, number}} ドル、メンバーごとの価格です。最初の {{count}} テナントメンバーは無料です。',
    tooltip_other:
      '追加機能は月額 {{price, number}} ドル、メンバーごとの価格です。最初の {{count}} テナントメンバーは無料です。',
    tooltip_for_enterprise:
      '最初の {{basicQuota}} のテナントメンバーは契約ベースのプランで含まれており、無料で使用できます。より多くが必要な場合、月額 {{price, number}} ドルのメンバーごとの料金がかかります。',
  },
  tokens: {
    title: 'トークン',
    tooltip:
      '追加機能として、{{tokenLimit}} トークンにつき {{price, number}} ドルの料金です。最初の {{basicQuota}} トークンは含まれています。',
    tooltip_for_enterprise:
      '最初の {{basicQuota}} トークンは契約ベースのプランで含まれており、無料で使用できます。より多くが必要な場合、{{tokenLimit}} トークンにつき月額 {{price, number}} ドルの料金がかかります。',
  },
  hooks: {
    title: 'フック',
    tooltip:
      '追加機能として、フックごとに {{price, number}} ドルの料金です。最初の 10 個のフックは含まれています。',
    tooltip_for_enterprise:
      '最初の {{basicQuota}} フックは契約ベースのプランで含まれており、無料で使用できます。より多くが必要な場合、月額 {{price, number}} ドルのフックごとの料金がかかります。',
  },
  security_features: {
    title: '高度なセキュリティ',
    tooltip:
      'フルの高度なセキュリティバンドル（CAPTCHA、識別子ロックアウト、メール ブロックリストなどを含む）は月額 {{price, number}} ドルで提供されるアドオン機能です。',
  },
  saml_applications: {
    title: 'SAML アプリ',
    tooltip: '追加機能として、月額 {{price, number}} ドルの SAML アプリごとの料金です。 ',
  },
  third_party_applications: {
    title: 'サードパーティ アプリ',
    tooltip: '追加機能として、月額 {{price, number}} ドルのアプリごとの料金です。',
  },
  rbacEnabled: {
    title: 'ロール',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルの定額料金です。グローバル ロールの数には影響されません。',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '現在の請求サイクル中に変更を行った場合、次の請求書には変更後の最初の月に少し高くなる可能性があります。それは {{price, number}} ドルの基本価格に、未請求の使用の追加機能の費用と、次のサイクルの全額が加算されます。<a>さらに詳しく</a>',
  },
};

export default Object.freeze(usage);
