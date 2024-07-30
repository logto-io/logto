import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'サインインエクスペリエンス',
  title: 'サインインエクスペリエンス',
  description: 'ブランドに合わせてサインイン UI をカスタマイズし、リアルタイムで表示できます。',
  tabs: {
    branding: 'ブランディング',
    sign_up_and_sign_in: 'サインアップとサインイン',
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
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'まだ SMS コネクタが設定されていません。構成を完了する前に、この方法でのサインインはできません。<a>{{link}}</a>「コネクタ」に移動してください',
    no_connector_email:
      'まだメールコネクタが設定されていません。構成を完了する前に、この方法でのサインインはできません。<a>{{link}}</a>「コネクタ」に移動してください',
    no_connector_social:
      'まだソーシャルコネクタを設定していません。ソーシャルサインインの方法を適用するには、まずコネクタを追加してください。<a>{{link}}</a> の中で「コネクタ」をご覧ください。',
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
};

export default Object.freeze(sign_in_exp);
