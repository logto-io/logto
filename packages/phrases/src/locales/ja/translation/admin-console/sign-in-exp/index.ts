import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'サインインエクスペリエンス',
  title: 'サインインエクスペリエンス',
  description: 'ブランドに合わせてサインインUIをカスタマイズし、リアルタイムで表示できます。',
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
      'あなたのアプリは、ブランドカラーとLogtoアルゴリズムに基づいて自動生成されたダークモードのテーマを持っています。自由にカスタマイズしてください。',
    dark_mode_reset_tip: 'ブランドカラーに基づいてダークモードの色を再計算します。',
    reset: 'リセット',
  },
  branding: {
    title: 'ブランディングエリア',
    ui_style: 'スタイル',
    favicon: 'ファビコン',
    logo_image_url: 'アプリのロゴ画像URL',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'アプリのロゴ画像URL（ダーク）',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: 'アプリのロゴ',
    dark_logo_image: 'アプリのロゴ（ダーク）',
    logo_image_error: 'アプリのロゴ：{{error}}',
    favicon_error: 'ファビコン：{{error}}',
  },
  custom_css: {
    title: 'カスタムCSS',
    css_code_editor_title: 'カスタムCSSでUIをパーソナライズ',
    css_code_editor_description1: 'カスタムCSSの例を見てください。',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'さらに詳しく',
    css_code_editor_content_placeholder:
      'カスタムCSSを入力して、すべてのスタイルをあなたの仕様に合わせて調整します。クリエイティビティを発揮して、UIを際立たせましょう。',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'まだSMSコネクタが設定されていません。構成を完了する前に、この方法でのサインインはできません。<a>{{link}}</a>「コネクタ」に移動してください',
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
    desktop_web: 'デスクトップWeb',
    mobile_web: 'モバイルWeb',
    desktop: 'デスクトップ',
    mobile: 'モバイル',
  },
};

export default Object.freeze(sign_in_exp);
