import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'サインインエクスペリエンス',
  page_title_with_account: 'サインインとアカウント',
  title: 'サインインとアカウント',
  description:
    '認証フローと UI をカスタマイズし、すぐに使えるエクスペリエンスをリアルタイムでプレビューします。',
  tabs: {
    branding: 'ブランディング',
    sign_up_and_sign_in: 'サインアップとサインイン',
    collect_user_profile: 'ユーザープロフィールを収集',
    account_center: 'アカウントセンター',
    content: '内容',
    password_policy: 'パスワードポリシー',
  },
  welcome: {
    title: 'サインインエクスペリエンスをカスタマイズ',
    description:
      '最初のサインイン設定をスムーズに始めましょう。このガイドでは、必要なすべての設定を説明します。',
    get_started: '開始',
    apply_remind:
      'サインインエクスペリエンスは、このアカウントのすべてのアプリケーションに適用されます。',
  },
  color: {
    title: 'カラー',
    primary_color: 'ブランドカラー',
    dark_primary_color: 'ブランドカラー（ダーク）',
    dark_mode: 'ダークモードを有効にする',
    dark_mode_description:
      'あなたのアプリは、ブランドカラーと Logto アルゴリズムに基づいて自動生成されたダークモードのテーマを持っています。自由にカスタマイズしてください。',
    dark_mode_reset_tip: 'ブランドカラーに基づいてダークモードの色を再計算します。',
    reset: 'リセット',
  },
  branding: {
    title: 'ブランディングエリア',
    ui_style: 'スタイル',
    with_light: '{{value}}',
    with_dark: '{{value}} (ダーク)',
    app_logo_and_favicon: 'アプリロゴとファビコン',
    company_logo_and_favicon: '企業ロゴとファビコン',
    organization_logo_and_favicon: '組織のロゴとファビコン',
  },
  branding_uploads: {
    app_logo: {
      title: 'アプリロゴ',
      url: 'アプリロゴ URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'アプリロゴ: {{error}}',
    },
    company_logo: {
      title: '企業ロゴ',
      url: '企業ロゴ URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '企業ロゴ: {{error}}',
    },
    organization_logo: {
      title: '画像をアップロード',
      url: '組織ロゴ URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '組織ロゴ: {{error}}',
    },
    connector_logo: {
      title: '画像をアップロード',
      url: 'コネクタロゴ URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'コネクタロゴ: {{error}}',
    },
    favicon: {
      title: 'ファビコン',
      url: 'ファビコン URL',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'ファビコン: {{error}}',
    },
  },
  custom_ui: {
    title: 'カスタム UI',
    css_code_editor_title: 'カスタム CSS',
    css_code_editor_description1: 'カスタム CSS の例をご覧ください。',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: '詳しくはこちら',
    css_code_editor_content_placeholder:
      'カスタム CSS を入力して、あらゆるスタイルを精確に調整してください。創造性を発揮して、あなたの UI を際立たせましょう。',
    bring_your_ui_title: 'あなたの UI を持参',
    bring_your_ui_description:
      '圧縮パッケージ (.zip) をアップロードして、Logto のビルトイン UI を独自のコードで置き換えます。<a>詳しくはこちら</a>',
    preview_with_bring_your_ui_description:
      'カスタム UI のアセットは正常にアップロードされ、現在提供されています。したがって、組み込みのプレビューウィンドウは無効になりました。\nパーソナライズされたサインイン UI をテストするには、「ライブプレビュー」ボタンをクリックして新しいブラウザタブで開きます。',
  },
  account_center: {
    title: 'アカウントセンター',
    description: 'Logto API を使用してアカウントセンターのフローをカスタマイズします。',
    enable_account_api: 'Account API を有効化',
    enable_account_api_description:
      'Account API を有効化すると、Logto Management API を使わずにエンドユーザーに直接 API アクセスを提供するカスタムアカウントセンターを構築できます。',
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: '有効',
      disabled: '無効',
    },
    sections: {
      account_security: {
        title: 'ACCOUNT SECURITY',
        description:
          'Manage access to the Account API, enabling users to view or edit their identity information and authentication factors after signing into the application. Users must verify their identity to get a valid 10-minute verification record ID before making these security-related changes.',
        groups: {
          identifiers: {
            title: 'Identifiers',
          },
          authentication_factors: {
            title: 'Authentication factors',
          },
        },
      },
      user_profile: {
        title: 'USER PROFILE',
        description:
          'Manage access to the Account API, enabling users to view or edit basic or custom profile data after signing into the application.',
        groups: {
          profile_data: {
            title: 'Profile data',
          },
        },
      },
      secret_vault: {
        title: 'シークレットボルト',
        description:
          'ソーシャルコネクタやエンタープライズコネクタ向けに、サードパーティのアクセストークンを安全に保存して、それらのAPI（例：Googleカレンダーにイベントを追加）を呼び出します。',
        third_party_token_storage: {
          title: 'サードパーティトークン',
          third_party_access_token_retrieval: 'サードパーティトークン',
          third_party_token_tooltip:
            'トークンを保存するには、対応するソーシャルコネクタまたはエンタープライズコネクタの設定でこれを有効にすることができます。',
          third_party_token_description:
            'Account APIが有効になると、サードパーティトークンの取得が自動的に有効になります。',
        },
      },
    },
    fields: {
      email: 'Email address',
      phone: 'Phone number',
      social: 'Social identities',
      password: 'Password',
      mfa: 'Multi-factor authentication',
      mfa_description: 'Let users manage their MFA methods from the account center.',
      username: 'Username',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profile',
      profile_description: 'Control access to structured profile attributes.',
      custom_data: 'Custom data',
      custom_data_description: 'Control access to custom JSON data stored on the user.',
    },
    webauthn_related_origins: 'WebAuthn 関連オリジン',
    webauthn_related_origins_description:
      'アカウント API を介してパスキーを登録できるフロントエンドアプリケーションのドメインを追加します。',
    webauthn_related_origins_error: 'オリジンは https:// または http:// で始まる必要があります',
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'まだ SMS コネクタが設定されていません。構成を完了する前に、この方法でのサインインはできません。<a>{{link}}</a>「コネクタ」に移動してください',
    no_connector_email:
      'まだメールコネクタが設定されていません。構成を完了する前に、この方法でのサインインはできません。<a>{{link}}</a>「コネクタ」に移動してください',
    no_connector_social:
      'まだソーシャルコネクタを設定していません。ソーシャルサインインの方法を適用するには、まずコネクタを追加してください。<a>{{link}}</a> の中で「コネクタ」をご覧ください。',
    no_connector_email_account_center:
      'メールコネクタがまだ設定されていません。<a>「メールおよびSMSコネクタ」</a>で設定してください。',
    no_connector_sms_account_center:
      'SMSコネクタがまだ設定されていません。<a>「メールおよびSMSコネクタ」</a>で設定してください。',
    no_connector_social_account_center:
      'ソーシャルコネクタがまだ設定されていません。<a>「ソーシャルコネクタ」</a>で設定してください。',
    no_mfa_factor:
      'まだ MFA ファクターが設定されていません。「多要素認証」で<a>{{link}}</a>してください。',
    setup_link: '設定',
  },
  save_alert: {
    description:
      '新しいサインイン方法やサインアップ手順を導入しています。すべてのユーザーに影響がある可能性があります。変更を実行する場合は、よろしいですか？',
    before: '変更前',
    after: '変更後',
    sign_up: 'サインアップ',
    sign_in: 'サインイン',
    social: 'ソーシャル',
    forgot_password_migration_notice:
      'パスワードを忘れた場合の検証をカスタムメソッドをサポートするようにアップグレードしました。以前は、これはメールと SMS コネクタによって自動的に決定されていました。アップグレードを完了するには<strong>確認</strong>をクリックしてください。',
  },
  preview: {
    title: 'サインインプレビュー',
    live_preview: 'ライブプレビュー',
    live_preview_tip: '変更を保存してプレビュー',
    native: 'ネイティブ',
    desktop_web: 'デスクトップ Web',
    mobile_web: 'モバイル Web',
    desktop: 'デスクトップ',
    mobile: 'モバイル',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
