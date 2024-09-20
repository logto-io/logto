const add_on = {
  mfa_inline_notification:
    'MFA は {{planName}} のアドオンとして月額 ${{price, number}} です。初月は請求サイクルに基づいて日割り計算されます。<a>詳細はこちら</a>',
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
  },
};

export default Object.freeze(add_on);
