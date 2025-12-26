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
    hide_logto_branding: 'Logtoのブランディングを非表示にする',
    hide_logto_branding_description:
      '「Powered by Logto」を削除します。クリーンでプロフェッショナルなサインイン体験で自社ブランドだけを際立たせましょう。',
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
      'Account API を有効化してカスタムのアカウントセンターを構築し、Logto 管理 API を使わずにエンドユーザーへ直接 API へのアクセスを提供します。',
    field_options: {
      off: 'オフ',
      edit: '編集',
      read_only: '閲覧のみ',
      enabled: '有効',
      disabled: '無効',
    },
    sections: {
      account_security: {
        title: 'アカウントセキュリティ',
        description:
          'Account API へのアクセスを管理し、ユーザーがアプリにサインインした後に本人情報や認証要素を表示または編集できるようにします。これらのセキュリティ関連の変更を行う前に、ユーザーは本人確認を行い、有効期限 10 分の検証レコード ID を取得する必要があります。',
        groups: {
          identifiers: {
            title: '識別子',
          },
          authentication_factors: {
            title: '認証要素',
          },
        },
      },
      user_profile: {
        title: 'ユーザープロフィール',
        description:
          'Account API へのアクセスを管理し、ユーザーがアプリにサインインした後に基本またはカスタムのプロフィールデータを表示・編集できるようにします。',
        groups: {
          profile_data: {
            title: 'プロフィールデータ',
          },
        },
      },
      secret_vault: {
        title: 'シークレットボルト',
        description:
          'ソーシャルおよびエンタープライズ連携向けに、サードパーティのアクセス トークンを安全に保管して、その API を呼び出します（例: Google カレンダーにイベントを追加）。',
        third_party_token_storage: {
          title: 'サードパーティトークン',
          third_party_access_token_retrieval: 'サードパーティアクセス トークンの取得',
          third_party_token_tooltip:
            'トークンを保存するには、対応するソーシャルまたはエンタープライズ連携の設定でこの機能を有効にしてください。',
          third_party_token_description:
            'Account API を有効にすると、サードパーティトークンの取得が自動的に有効になります。',
        },
      },
    },
    fields: {
      email: 'メールアドレス',
      phone: '電話番号',
      social: 'ソーシャル ID',
      password: 'パスワード',
      mfa: '多要素認証',
      mfa_description: 'ユーザーがアカウントセンターから MFA 方法を管理できるようにします。',
      username: 'ユーザー名',
      name: '名前',
      avatar: 'アバター',
      profile: 'プロフィール',
      profile_description: '構造化されたプロフィール属性へのアクセスを制御します。',
      custom_data: 'カスタムデータ',
      custom_data_description:
        'ユーザーに保存されているカスタム JSON データへのアクセスを制御します。',
    },
    webauthn_related_origins: 'WebAuthn 関連オリジン',
    webauthn_related_origins_description:
      'Account API を通じてパスキーを登録できるフロントエンドアプリケーションのドメインを追加します。',
    webauthn_related_origins_error: 'オリジンは https:// または http:// で始める必要があります',
    prebuilt_ui: {
      /** UNTRANSLATED */
      title: 'INTEGRATE PREBUILT UI',
      /** UNTRANSLATED */
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      /** UNTRANSLATED */
      flows_title: 'Integrate out-of-the-box security setting flows',
      /** UNTRANSLATED */
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        /** UNTRANSLATED */
        email: 'Update your primary email address',
        /** UNTRANSLATED */
        phone: 'Update your primary phone number',
        /** UNTRANSLATED */
        username: 'Update your username',
        /** UNTRANSLATED */
        password: 'Set a new password',
        /** UNTRANSLATED */
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        /** UNTRANSLATED */
        passkey_add: 'Register a new passkey',
        /** UNTRANSLATED */
        passkey_manage: 'Manage your existing passkeys or add new ones',
        /** UNTRANSLATED */
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        /** UNTRANSLATED */
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      /** UNTRANSLATED */
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      /** UNTRANSLATED */
      customize_link: 'customize your flows with the Account API instead.',
    },
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
    no_mfa_factor: 'まだ MFA ファクターが設定されていません。<a>{{link}}</a>で設定してください。',
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
