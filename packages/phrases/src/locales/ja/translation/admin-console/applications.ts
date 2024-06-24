const applications = {
  page_title: 'アプリケーション ',
  title: 'アプリケーション ',
  subtitle:
    'ネイティブ、シングルページ、マシン・トゥ・マシン、または従来のアプリケーションにLogto認証を設定する',
  subtitle_with_app_type: 'あなたの {{name}} アプリケーションに Logto 認証を設定する',
  create: 'アプリケーションを作成する',
  create_subtitle_third_party:
    'LogtoをIdentity Provider（IdP）として使用し、サードパーティアプリケーションと簡単に統合できます',
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
      subtitle: 'Webブラウザで実行され、データを動的に更新するアプリケーション',
      description: '例：React DOMアプリ、Vueアプリ',
    },
    traditional: {
      title: '従来的なWeb',
      subtitle: 'Webサーバーのみでページをレンダリングおよび更新するアプリケーション',
      description: '例：Next.js、PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'リソースに直接アクセスするアプリケーション（通常はサービス）',
      description: '例：バックエンドサービス',
    },
    protected: {
      title: 'Protected App',
      subtitle: 'Logtoによって保護されたアプリ',
      description: 'N/A',
    },
    third_party: {
      title: 'Third-party App',
      subtitle: 'サードパーティIdPコネクターとして使用されるアプリ',
      description: '例：OIDC、SAML',
    },
  },
  placeholder_title: '続行するにはアプリケーションタイプを選択してください',
  placeholder_description:
    'LogtoはOIDCのためにアプリケーションエンティティを使用して、アプリケーションの識別、サインインの管理、監査ログの作成などのタスクをサポートします。',
};

export default Object.freeze(applications);
