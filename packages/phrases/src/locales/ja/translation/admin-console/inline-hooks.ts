const inline_hooks = {
  page_title: 'インラインフック',
  title: 'インラインフック',
  subtitle: '認証フローの特定のポイントでカスタムコードを実行し、Logto の動作を拡張します。',
  status: {
    not_configured: '未設定',
    configured: '設定済み',
    enabled: '有効',
    disabled: '無効',
  },
  hooks: {
    post_first_factor_verification: {
      name: '第1要素の検証後',
      description:
        '最初の認証要素が検証されてからサインインが続行されるまでの間に、カスタムロジックを実行します。',
    },
    post_sign_in: {
      name: 'サインイン後',
      description: 'ユーザーが正常にサインインした後に、カスタムロジックを実行します。',
    },
  },
};

export default Object.freeze(inline_hooks);
