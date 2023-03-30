const cloud = {
  welcome: {
    page_title: 'ようこそ',
    title: 'ようこそ、あなたのLogto Cloud Previewを作成しましょう',
    description:
      'オープンソースユーザーでもクラウドユーザーでも、ショーケースを見て、Logtoのすべての価値を体験してください。Cloud PreviewはLogto Cloudの予備バージョンでもあります。',
    project_field: 'ログトを使用しています',
    project_options: {
      personal: '個人プロジェクト',
      company: '会社プロジェクト',
    },
    deployment_type_field: 'オープンソースまたはクラウドを希望しますか？',
    deployment_type_options: {
      open_source: 'オープンソース',
      cloud: 'クラウド',
    },
  },
  about: {
    page_title: 'あなたについて',
    title: 'あなたについて少し教えてください',
    description:
      'あなたの情報を知ることで、あなたにユニークなLogtoエクスペリエンスを提供します。あなたの情報は安全に保管されます。',
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
  congrats: {
    page_title: '早期クレジットを獲得',
    title: '素晴らしい！あなたはLogto Cloudの早期クレジットを獲得する資格があります！',
    description:
      'Logto Cloudの正式開始後、無料で60日間のサブスクリプションを楽しむチャンスを逃さないでください！ 詳しくは今すぐLogtoチームにお問い合わせください。',
    check_out_button: 'ライブプレビューをチェックアウト',
    email_us_title: '特別オファーや価格詳細のためにメールを送信してください',
    email_us_description: 'お金を節約するために独占的な価格を手に入れる',
    email_us_button: 'メールを送信する',
    join_description:
      '他の開発者と接続してチャットできるパブリック<a>{{link}}</a>に参加してください。',
    discord_link: 'discordチャンネル',
    enter_admin_console: 'Logto Cloud Previewに入る',
  },
  gift: {
    title: '早期クレジット獲得で60日間無料利用可能',
    description: '早期クレジットのためにLogtoチームとの一対一のセッションを予約してください。',
    reserve_title: 'Logtoチームとの会議を予約',
    reserve_description: 'クレジットは審査後にのみ有効になります。',
    book_button: '予約する',
    email_us_title: 'メールでお問い合わせ',
    email_us_description: '特別オファーや価格の詳細についてお問い合わせください。',
    email_us_button: '送信する',
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
  broadcast: '📣Logto Cloud（Preview）に入っています',
  socialCallback: {
    title: 'ログインが成功しました',
    description:
      'ソーシャルアカウントを使用して正常にサインインしました。Logtoのすべての機能にシームレスにアクセスできるようにするために、独自のソーシャルコネクタを設定することをお勧めします。',
  },
};

export default cloud;
