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
    /** UNTRANSLATED */
    saml_apps:
      'Additional SAML apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    /** UNTRANSLATED */
    third_party_apps:
      'Additional third-party apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(add_on);
