const description = {
  email: 'メールアドレス',
  phone_number: '電話番号',
  username: 'ユーザー名',
  reminder: 'リマインダー',
  not_found: '404 Not Found',
  agree_with_terms: '以下に同意することを確認しました：',
  agree_with_terms_modal: '続行するには、<link></link>に同意してください。',
  terms_of_use: '利用規約',
  sign_in: 'サインイン',
  privacy_policy: 'プライバシーポリシー',
  create_account: 'アカウントを作成する',
  or: 'または',
  and: '及び',
  enter_passcode: '確認コードが{{address}} {{target}}に送信されました',
  passcode_sent: '確認コードを再送します',
  resend_after_seconds: '<span>{{seconds}}</span>秒後に再送信',
  resend_passcode: '確認コードを再送信します',
  create_account_id_exists:
    '{{type}} {{value}}でアカウントが既に存在しています。ログインしますか？',
  link_account_id_exists: '{{type}} {{value}}でアカウントが既に存在しています。リンクしますか？',
  sign_in_id_does_not_exist:
    '{{type}} {{value}}のアカウントは存在しません。新しいアカウントを作成しますか？',
  sign_in_id_does_not_exist_alert: '{{type}} {{value}}のアカウントは存在しません。',
  create_account_id_exists_alert:
    '{{type}} {{value}}は他のアカウントにリンクされています。他の{{type}}を試してください。',
  social_identity_exist:
    '{{type}} {{value}}は他のアカウントにリンクされています。他の{{type}}を試してください。',
  bind_account_title: 'アカウントのリンクまたは作成',
  social_create_account: '新しいアカウントを作成できます。',
  social_link_email: '別のメールアドレスをリンクできます。',
  social_link_phone: '他の電話番号にリンクできます。',
  social_link_email_or_phone: '他のメールアドレスまたは電話番号にリンクできます。',
  social_bind_with_existing: '関連するアカウントが見つかりました。それを直接リンクできます。',
  reset_password: 'パスワードを再設定する',
  reset_password_description:
    'アカウントに関連する{{types, list(type: disjunction;)}}を入力すると、パスワードの再設定に必要な確認コードが送信されます。',
  new_password: '新しいパスワード',
  set_password: 'パスワードを設定する',
  password_changed: 'パスワードが変更されました',
  no_account: 'アカウントを作成していませんか？',
  have_account: 'すでにアカウントをお持ちですか？',
  enter_password: 'パスワードを入力する',
  enter_password_for: '{{method}} {{value}}でパスワードでサインインする',
  enter_username: 'ユーザー名を入力する',
  enter_username_description:
    'ユーザー名はサインインの代替手段です。ユーザー名には、文字、数字、アンダースコアのみを含める必要があります。',
  link_email: 'メールアドレスをリンクする',
  link_phone: '電話番号をリンクする',
  link_email_or_phone: 'メールアドレスまたは電話番号をリンクする',
  link_email_description:
    'セキュリティを高めるために、アカウントにメールアドレスをリンクしてください。',
  link_phone_description: 'セキュリティを高めるために、アカウントに電話番号をリンクしてください。',
  link_email_or_phone_description:
    'セキュリティを高めるために、アカウントに別のメールアドレスまたは電話番号をリンクしてください。',
  continue_with_more_information:
    '以下にアカウントの詳細を入力して、セキュリティを高めてください。',
  create_your_account: 'アカウントを作成する',
  sign_in_to_your_account: 'アカウントにサインインする',
  no_region_code_found: '地域コードが見つかりません',
  verify_email: 'Eメールを確認する',
  verify_phone: '電話番号を確認する',
  password_requirements: 'パスワード {{items, list}}。',
  password_requirement: {
    length_one: '最低 {{count}} 文字',
    length_other: '最低 {{count}} 文字',
    character_types_one: '大文字、小文字、数字、記号のうち {{count}} 種類を含む必要があります',
    character_types_other: '大文字、小文字、数字、記号のうち {{count}} 種類を含む必要があります',
  },
  use: '使用する',
  single_sign_on_email_form: '企業のメールアドレスを入力してください',
  single_sign_on_connectors_list:
    'あなたの企業は、メールアカウント{{email}}に対してシングルサインオンを有効にしました。以下のSSOプロバイダーを使用してサインインを続けることができます。',
  single_sign_on_enabled: 'このアカウントではシングル サインオンが有効になっています',
  /** UNTRANSLATED */
  authorize_title: 'Authorize {{name}}',
  /** UNTRANSLATED */
  request_permission: '{{name}} is requesting access to:',
  /** UNTRANSLATED */
  grant_organization_access: 'Grant the organization access:',
  /** UNTRANSLATED */
  authorize_personal_data_usage: 'Authorize the use of your personal data:',
  /** UNTRANSLATED */
  authorize_organization_access: 'Authorize access to the specific organization:',
  /** UNTRANSLATED */
  user_scopes: 'Personal user data',
  /** UNTRANSLATED */
  organization_scopes: 'Organization access',
  /** UNTRANSLATED */
  authorize_agreement: `By authorizing the access, you agree to the {{name}}'s <link></link>.`,
  /** UNTRANSLATED */
  authorize_agreement_with_redirect: `By authorizing the access, you agree to the {{name}}'s <link></link>, and will be redirected to {{uri}}.`,
  /** UNTRANSLATED */
  not_you: 'Not you?',
  /** UNTRANSLATED */
  user_id: 'User ID: {{id}}',
  /** UNTRANSLATED */
  redirect_to: 'You will be redirected to {{name}}.',
};

export default Object.freeze(description);
