const cloud = {
  general: {
    onboarding: 'オンボーディング',
  },
  welcome: {
    page_title: 'ようこそ',
    title: 'Logto Cloud へようこそ！あなたについて少し学びたいです。',
    description:
      'あなたの情報を知ることで、あなたにユニークなLogtoエクスペリエンスを提供します。あなたの情報は安全に保管されます。',
    project_field: 'ログトを使用しています',
    project_options: {
      personal: '個人プロジェクト',
      company: '会社プロジェクト',
    },
    company_name_field: '会社名',
    company_name_placeholder: 'Acme.co',
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
    },
  },
  sie: {
    page_title: 'サインインエクスペリエンスのカスタマイズ',
    title: 'まずは簡単にサインインエクスペリエンスをカスタマイズしましょう',
    inspire: {
      title: '魅力的な例を作成',
      description:
        'サインインエクスペリエンスに自信がない場合は、「Inspire Me」をクリックして、マジックが行われるのを待ちましょう！',
      inspire_me: 'インスパイア',
    },
    logo_field: 'アプリのロゴ',
    color_field: 'ブランドカラー',
    identifier_field: '識別子',
    identifier_options: {
      email: 'メール',
      phone: '電話',
      user_name: 'ユーザー名',
    },
    authn_field: '認証',
    authn_options: {
      password: 'パスワード',
      verification_code: '検証コード',
    },
    social_field: 'ソーシャルサインイン',
    finish_and_done: '完了',
    preview: {
      mobile_tab: 'モバイル',
      web_tab: 'Web',
    },
    connectors: {
      unlocked_later: '後でロックを解除',
      unlocked_later_tip:
        'オンボーディングプロセスを完了してプロダクトに入った後、より多くのソーシャルサインイン方法にアクセスできるようになります。',
      notice:
        '本番目的でのデモコネクタの使用は避けてください。テストを完了したら、デモコネクタを削除し、自分のクレデンシャルを使用して独自のコネクタを設定してください。',
    },
  },
  socialCallback: {
    title: 'ログインが成功しました',
    description:
      'ソーシャルアカウントを使用して正常にサインインしました。Logtoのすべての機能にシームレスにアクセスできるようにするために、独自のソーシャルコネクタを設定することをお勧めします。',
  },
  tenant: {
    create_tenant: 'テナントを作成する',
  },
};

export default Object.freeze(cloud);
