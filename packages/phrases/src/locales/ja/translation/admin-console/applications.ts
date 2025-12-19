const applications = {
  page_title: 'アプリケーション ',
  title: 'アプリケーション ',
  subtitle:
    'ネイティブ、シングルページ、マシン・トゥ・マシン、または従来のアプリケーションに Logto 認証を設定する',
  subtitle_with_app_type: 'あなたの {{name}} アプリケーションに Logto 認証を設定する',
  create: 'アプリケーションを作成する',
  create_third_party: 'サードパーティアプリケーションを作成する',
  create_thrid_party_modal_title: 'サードパーティアプリを作成する（{{type}}）',
  application_name: 'アプリケーション名',
  application_name_placeholder: '私のアプリ',
  application_description: 'アプリケーションの説明',
  application_description_placeholder: 'アプリケーションの説明を入力してください',
  select_application_type: 'アプリケーションタイプを選択してください',
  no_application_type_selected: 'まだアプリケーションタイプが選択されていません',
  application_created: 'アプリケーションが正常に作成されました。',
  tab: {
    my_applications: 'My apps',
    third_party_applications: 'Third-party apps',
  },
  app_id: 'App ID',
  type: {
    native: {
      title: 'ネイティブアプリ',
      subtitle: 'ネイティブ環境で実行されるアプリケーション',
      description: '例：iOSアプリ、Androidアプリ',
    },
    spa: {
      title: 'シングルページアプリ',
      subtitle: 'Web ブラウザで実行され、データを動的に更新するアプリケーション',
      description: '例：React DOM アプリ、Vue アプリ',
    },
    traditional: {
      title: '従来的な Web',
      subtitle: 'Web サーバーのみでページをレンダリングおよび更新するアプリケーション',
      description: '例：Next.js、PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'リソースに直接アクセスするアプリケーション（通常はサービス）',
      description: '例：バックエンドサービス',
    },
    protected: {
      title: 'Protected App',
      subtitle: 'Logto によって保護されたアプリ',
      description: 'N/A',
    },
    saml: {
      title: 'SAML アプリ',
      subtitle: 'SAML IdP コネクターとして使用されるアプリ',
      description: '例：SAML',
    },
    third_party: {
      title: 'Third-party App',
      subtitle: 'サードパーティ IdP コネクターとして使用されるアプリ',
      description: '例：OIDC、SAML',
    },
  },
  placeholder_title: '続行するにはアプリケーションタイプを選択してください',
  placeholder_description:
    'Logto は OIDC のためにアプリケーションエンティティを使用して、アプリケーションの識別、サインインの管理、監査ログの作成などのタスクをサポートします。',
  third_party_application_placeholder_description:
    'Logto を ID プロバイダーとして使用して、サードパーティのサービスに OAuth 承認を提供します。 \n リソースアクセスのための事前構築されたユーザー同意画面が含まれています。<a>詳細を確認</a>',
  guide: {
    third_party: {
      title: 'サードパーティアプリケーションを統合する',
      description:
        'Logto を ID プロバイダーとして使用して、サードパーティのサービスに OAuth 承認を提供します。安全なリソースアクセスのための事前構築されたユーザー同意画面が含まれています。<a>詳細はこちら</a>',
    },
  },
};

export default Object.freeze(applications);
