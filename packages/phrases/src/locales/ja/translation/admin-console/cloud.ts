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
    title_field: 'あなたのタイトル',
    title_options: {
      developer: '開発者',
      team_lead: 'チームリード',
      ceo: 'CEO',
      cto: 'CTO',
      product: 'プロダクト',
      others: 'その他',
    },
    company_name_field: '会社名',
    company_name_placeholder: 'Acme.co',
    company_size_field: '会社の規模は？',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: 'サインアップの理由は？',
    reason_options: {
      passwordless: 'パスワードレス認証と UI キットを探したい',
      efficiency: '即時利用可能な ID インフラを探したい',
      access_control: '役割と責任に基づくユーザーアクセスを制御したい',
      multi_tenancy: 'マルチテナント製品の戦略を探しています',
      enterprise: '企業規模に向けた SSO ソリューションを探しています',
      others: 'その他',
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

export default cloud;
