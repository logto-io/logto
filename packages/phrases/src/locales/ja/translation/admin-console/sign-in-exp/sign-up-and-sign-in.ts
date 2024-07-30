const sign_up_and_sign_in = {
  identifiers_email: 'メールアドレス',
  identifiers_phone: '電話番号',
  identifiers_username: 'ユーザー名',
  identifiers_email_or_sms: 'メールアドレスまたは電話番号',
  identifiers_none: '該当なし',
  and: 'および',
  or: 'または',
  sign_up: {
    title: 'サインアップ',
    sign_up_identifier: 'サインアップ識別子',
    identifier_description:
      'サインアップ識別子はアカウント作成に必要で、サインイン画面に含める必要があります。',
    sign_up_authentication: 'サインアップの認証設定',
    authentication_description:
      '選択したすべてのアクションは、ユーザーがフローを完了するために必須です。',
    set_a_password_option: 'パスワードの設定',
    verify_at_sign_up_option: 'サインアップ時に確認する',
    social_only_creation_description: '（これはソーシャルアカウント作成に適用されます）',
  },
  sign_in: {
    title: 'サインイン',
    sign_in_identifier_and_auth: 'サインインの識別子と認証設定',
    description:
      'ユーザーは利用可能なすべてのオプションを使用してサインインできます。下のオプションをドラッグ＆ドロップしてレイアウトを調整してください。',
    add_sign_in_method: 'サインイン方法を追加',
    password_auth: 'パスワード',
    verification_code_auth: '確認コード',
    auth_swap_tip: '以下のオプションを交換して、フローで最初に表示されるオプションを決定します。',
    require_auth_factor: '少なくとも 1 つの認証要素を選択する必要があります。',
  },
  social_sign_in: {
    title: 'ソーシャルサインイン',
    social_sign_in: 'ソーシャルサインイン',
    description:
      '設定した必須識別子に応じて、ユーザーはソーシャルコネクタを介してサインアップする際に識別子を提供するよう求められる場合があります。',
    add_social_connector: 'ソーシャルコネクタを追加',
    set_up_hint: {
      not_in_list: '一覧にない場合は?',
      set_up_more: '設定',
      go_to: '他のソーシャルコネクタに移動します。',
    },
    automatic_account_linking: '自動アカウントリンク',
    automatic_account_linking_label:
      'オンにすると、ユーザーがシステムに新しいソーシャルアイデンティティでサインインし、同じ識別子 (例：メールアドレス) を持つ既存のアカウントが 1 つだけ存在する場合、Logto はアカウントリンクのプロンプトを表示する代わりに、そのアカウントをソーシャルアイデンティティに自動的にリンクします。',
  },
  tip: {
    set_a_password: 'ユーザー名にユニークなパスワードを設定することが重要です。',
    verify_at_sign_up:
      '現在、検証されたメールアドレスのみをサポートしています。検証がない場合、ユーザーベースには低品質のメールアドレスが多数含まれる場合があります。',
    password_auth:
      'これは、サインアッププロセス中にパスワードを設定するオプションを有効にした場合に必要です。',
    verification_code_auth:
      'これは、サインアップ時に確認コードの提供オプションのみを有効にした場合に必要です。サインアッププロセスでパスワード設定を許可する場合は、ボックスのチェックを外してもかまいません。',
    delete_sign_in_method: 'これは {{identifier}} を必須の識別子として選択した場合に必要です。',
  },
  advanced_options: {
    title: '高度なオプション',
    enable_single_sign_on: '企業向けシングルサインオン (SSO) を有効にする',
    enable_single_sign_on_description:
      'ユーザーが企業のアイデンティティを使用してアプリケーションにサインインできるようにします。',
    single_sign_on_hint: {
      prefix: '詳細は、',
      link: '"企業向けSSO"',
      suffix: 'セクションをご覧ください。',
    },
    enable_user_registration: 'ユーザー登録を有効にする',
    enable_user_registration_description:
      'ユーザー登録を有効または無効にできます。無効にすると、ユーザーは管理コンソールで追加できますが、サインイン画面でアカウントを作成することはできません。',
  },
};

export default Object.freeze(sign_up_and_sign_in);
