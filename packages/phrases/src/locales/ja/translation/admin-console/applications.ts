const applications = {
  page_title: 'アプリケーション ',
  title: 'アプリケーション ',
  subtitle:
    'ネイティブ、シングルページ、マシン・トゥ・マシン、または従来のアプリケーションにLogto認証を設定する',
  create: 'アプリケーションを作成する',
  application_name: 'アプリケーション名',
  application_name_placeholder: '私のアプリ',
  application_description: 'アプリケーションの説明',
  application_description_placeholder: 'アプリケーションの説明を入力してください',
  select_application_type: 'アプリケーションタイプを選択してください',
  no_application_type_selected: 'まだアプリケーションタイプが選択されていません',
  application_created:
    'アプリケーション {{name}} が正常に作成されました。\n今すぐアプリケーション設定を完了してください。',
  app_id: 'アプリID',
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
    header_title: 'Select a framework or tutorial', // UNTRANSLATED
    modal_header_title: 'Start with SDK and guides', // UNTRANSLATED
    header_subtitle: 'Jumpstart your app development process with our pre-built SDK and tutorials.', // UNTRANSLATED
    start_building: 'Start Building', // UNTRANSLATED
    categories: {
      featured: 'Popular and for you', // UNTRANSLATED
      Traditional: 'Traditional web app', // UNTRANSLATED
      SPA: 'Single page app', // UNTRANSLATED
      Native: 'Native', // UNTRANSLATED
      MachineToMachine: 'Machine-to-machine', // UNTRANSLATED
    },
    filter: {
      title: 'Filter framework', // UNTRANSLATED
      placeholder: 'Search for framework', // UNTRANSLATED
    },
    get_sample_file: 'サンプルを取得する',
    title: 'アプリケーションが正常に作成されました',
    subtitle:
      '以下の手順に従ってアプリの設定を完了してください。SDKタイプを選択して続行してください。',
    description_by_sdk:
      'このクイックスタートガイドでは、{{sdk}}アプリにLogtoを統合する方法を説明します。',
    do_not_need_tutorial:
      'If you don’t need a tutorial, you can continue without a framework guide', // UNTRANSLATED
    create_without_framework: 'Create app without framework', // UNTRANSLATED
    finish_and_done: '完了',
    cannot_find_guide: "Can't find your guide?", // UNTRANSLATED
    describe_guide_looking_for: 'Describe the guide you are looking for', // UNTRANSLATED
    describe_guide_looking_for_placeholder: 'E.g., I want to integrate Logto into my Angular app.', // UNTRANSLATED
    request_guide_successfully: 'Your request has been successfully submitted. Thank you!', // UNTRANSLATED
  },
  placeholder_title: '続行するにはアプリケーションタイプを選択してください',
  placeholder_description:
    'LogtoはOIDCのためにアプリケーションエンティティを使用して、アプリケーションの識別、サインインの管理、監査ログの作成などのタスクをサポートします。',
};

export default Object.freeze(applications);
