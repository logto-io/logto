const add_on = {
  mfa_inline_notification:
    'MFA は {{planName}} のアドオンとして月額 ${{price, number}} です。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
  security_features_inline_notification:
    'CAPTCHA、有料のロックアウト体験、その他の高度なセキュリティ機能を有効にします - すべて月額 ${{price, number}} のアドオンバンドルに含まれています。',
  footer: {
    api_resource:
      '追加リソースは <span>月額 ${{price, number}} / 個</span> です。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
    machine_to_machine_app:
      '追加のマシン間アプリは <span>月額 ${{price, number}} / 個</span> です。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
    enterprise_sso:
      'エンタープライズ SSO は {{planName}} のアドオンとして <span>月額 ${{price, number}} / 個</span> です。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
    tenant_members:
      '追加メンバーは <span>月額 ${{price, number}} / 個</span> です。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
    organization:
      '組織は {{planName}} のアドオンとして <span>月額 ${{price, number}}</span> で、無制限の組織をサポートします。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
    saml_apps:
      '追加の SAML アプリは <span>月額 ${{price, number}} / 個</span> のコストがかかります。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
    third_party_apps:
      '追加のサードパーティアプリは <span>月額 ${{price, number}} / 個</span> のコストがかかります。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
    roles:
      '役割ベースのアクセス制御はプロ プラン用の <span>月額 ${{price, number}}</span> のアドオンで、無制限の役割があります。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
  },
};

export default Object.freeze(add_on);
