const applications = {
  page_title: 'アプリケーション ',
  title: 'アプリケーション ',
  subtitle:
    'ネイティブ、シングルページ、マシン・トゥ・マシン、または従来のアプリケーションにLogto認証を設定する',
  subtitle_with_app_type: 'あなたの {{name}} アプリケーションに Logto 認証を設定する',
  create: 'アプリケーションを作成する',
  application_name: 'アプリケーション名',
  application_name_placeholder: '私のアプリ',
  application_description: 'アプリケーションの説明',
  application_description_placeholder: 'アプリケーションの説明を入力してください',
  select_application_type: 'アプリケーションタイプを選択してください',
  no_application_type_selected: 'まだアプリケーションタイプが選択されていません',
  application_created: 'アプリケーションが正常に作成されました。',
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
  },
  guide: {
    header_title: 'フレームワークまたはチュートリアルを選択',
    modal_header_title: 'SDK とガイドを利用して開始',
    header_subtitle:
      'プリビルドされた SDK とチュートリアルでアプリ開発プロセスをスタートさせましょう。',
    start_building: '作成を開始する',
    categories: {
      featured: 'おすすめ',
      Traditional: '従来の Web アプリ',
      SPA: 'シングルページアプリ',
      Native: 'ネイティブ',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'フレームワークをフィルタリング',
      placeholder: 'フレームワークを検索',
    },
    select_a_framework: 'フレームワークを選択',
    checkout_tutorial: '{{name}} のチュートリアルを確認する',
    get_sample_file: 'サンプルファイルを取得する',
    title: 'アプリケーションが正常に作成されました',
    subtitle:
      '以下の手順に従ってアプリの設定を完了してください。SDK タイプを選択して続行してください。',
    description_by_sdk:
      'このクイックスタートガイドでは、{{sdk}} アプリに Logto を統合する方法を説明します。',
    do_not_need_tutorial:
      'チュートリアルを必要としない場合は、フレームワークガイドなしで続行できます。',
    create_without_framework: 'フレームワークなしでアプリを作成',
    finish_and_done: '完了',
    cannot_find_guide: 'ガイドが見つかりませんか？',
    describe_guide_looking_for: 'お探しのガイドの内容を説明してください',
    describe_guide_looking_for_placeholder: '例： Angular アプリに Logto を統合したい。',
    request_guide_successfully: 'リクエストが正常に送信されました。ありがとうございます！',
  },
  placeholder_title: '続行するにはアプリケーションタイプを選択してください',
  placeholder_description:
    'LogtoはOIDCのためにアプリケーションエンティティを使用して、アプリケーションの識別、サインインの管理、監査ログの作成などのタスクをサポートします。',
};

export default Object.freeze(applications);
