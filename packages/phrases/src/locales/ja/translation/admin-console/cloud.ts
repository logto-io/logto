const cloud = {
  general: {
    onboarding: 'オンボーディング',
  },
  welcome: {
    page_title: 'ようこそ',
    title: 'Logto Cloud へようこそ！あなたについて少し学びたいです。',
    description:
      'あなたの情報を知ることで、あなたにユニークな Logto エクスペリエンスを提供します。あなたの情報は安全に保管されます。',
    project_field: 'ログトを使用しています',
    project_options: {
      personal: '個人プロジェクト',
      company: '会社プロジェクト',
    },
    company_name_field: '会社名',
    company_name_placeholder: 'Acme.co',
    stage_field: '製品は現在どの段階にありますか？',
    stage_options: {
      new_product: '新しいプロジェクトを開始し、素早く立ち上げたい場合',
      existing_product: '現在の認証（例：自社構築、Auth0、Cognito、Microsoft）から移行する',
      target_enterprise_ready:
        '大きなクライアントを獲得したため、製品を企業向けに販売できるようにしたい',
    },
    additional_features_field: '私たちに伝えたいことはありますか？',
    additional_features_options: {
      customize_ui_and_flow:
        '自分の UI を構築および管理し、Logto の事前に構築されたカスタマイズ可能なソリューションだけではなく使用する',
      compliance: 'SOC2 と GDPR は必須です',
      export_user_data: 'Logto からユーザーデータをエクスポートする機能が必要です',
      budget_control: '予算管理が非常に厳しいです',
      bring_own_auth: '独自の認証サービスを持っており、Logto の機能が必要な場合',
      others: '上記のどれにも該当しません',
    },
  },
  create_tenant: {
    page_title: 'テナントを作成',
    title: '最初のテナントを作成',
    description:
      'テナントはユーザーアイデンティティ、アプリケーション、およびその他すべての Logto リソースを管理するための独立した環境です。',
    invite_collaborators: 'メールでコラボレーターを招待',
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
      'ソーシャルアカウントを使用して正常にサインインしました。Logto のすべての機能にシームレスにアクセスできるようにするために、独自のソーシャルコネクタを設定することをお勧めします。',
  },
  tenant: {
    create_tenant: 'テナントを作成する',
  },
};

export default Object.freeze(cloud);
