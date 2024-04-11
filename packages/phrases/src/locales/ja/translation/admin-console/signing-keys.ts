const signing_keys = {
  title: '署名キー',
  description: 'アプリケーションで使用される署名キーを安全に管理します。',
  private_key: 'OIDCプライベートキー',
  private_keys_description: 'OIDCプライベートキーはJWTトークンの署名に使用されます。',
  cookie_key: 'OIDCクッキーキー',
  cookie_keys_description: 'OIDCクッキーキーはクッキーの署名に使用されます。',
  private_keys_in_use: '使用中のプライベートキー',
  cookie_keys_in_use: '使用中のCookieキー',
  rotate_private_keys: 'プライベートキーを回転させる',
  rotate_cookie_keys: 'Cookieキーを回転させる',
  rotate_private_keys_description:
    'このアクションは新しいプライベート署名キーを作成し、現在のキーを回転させ、前のキーを削除します。現在のキーで署名されたJWTトークンは、削除または別の回転まで有効です。',
  rotate_cookie_keys_description:
    'このアクションは新しいCookieキーを作成し、現在のキーを回転させ、前のキーを削除します。現在のキーで生成されたCookieは、削除または別の回転まで有効です。',
  select_private_key_algorithm: '新しいプライベートキーの署名キーアルゴリズムを選択',
  rotate_button: '回転',
  table_column: {
    id: 'ID',
    status: 'ステータス',
    algorithm: '署名キーアルゴリズム',
  },
  status: {
    current: '現在の',
    previous: '以前の',
  },
  reminder: {
    rotate_private_key:
      'OIDCプライベートキー</strong>を回転させますか？新しい発行されたJWTトークンは新しいキーで署名されます。既存のJWTトークンは、再度回転するまで有効です。',
    rotate_cookie_key:
      'OIDC Cookieキー</strong>を回転させますか？新しいCookieで署名されたサインインセッションのCookieが新しいCookieキーで生成されます。既存のCookieは、再度回転するまで有効です。',
    delete_private_key:
      'OIDCプライベートキー</strong>を削除しますか？このプライベート署名キーで署名された既存のJWTトークンはもはや有効ではありません。',
    delete_cookie_key:
      'OIDC Cookieキー</strong>を削除しますか？このCookieキーで署名された古いサインインセッションのCookieはもはや有効ではありません。これらのユーザーには再認証が必要です。',
  },
  messages: {
    rotate_key_success: '署名キーが正常に回転されました。',
    delete_key_success: 'キーが正常に削除されました。',
  },
};

export default Object.freeze(signing_keys);
