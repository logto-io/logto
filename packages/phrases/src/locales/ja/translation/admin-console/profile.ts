const profile = {
  link_account: {
    anonymous: '匿名',
  },

  delete_account: {
    title: 'アカウントを削除',
    label: 'アカウントを削除',
    description:
      'アカウントの削除は、すべての個人情報、ユーザーデータ、および設定が削除されます。このアクションは元に戻せません。',
    button: 'アカウントを削除',
    p: {
      has_issue:
        'アカウントを削除したいということで申し訳ありません。アカウントを削除する前に、以下の問題を解決する必要があります。',
      after_resolved:
        '問題が解決したら、アカウントを削除できます。サポートが必要な場合は、ご連絡ください。',
      check_information:
        'アカウントを削除したいということで申し訳ありません。続行する前に、以下の情報を注意深く確認してください。',
      remove_all_data:
        'アカウントを削除すると、Logto Cloud に関するすべてのデータが永久に削除されます。続行する前に、重要なデータをバックアップしてください。',
      confirm_information:
        '上記の情報が期待通りであることを確認してください。アカウントを削除すると、復元できなくなります。',
      has_admin_role: '次のテナントでは管理者権限があるため、アカウントと共に削除されます：',
      has_admin_role_other: '次のテナントでは管理者権限があるため、アカウントと共に削除されます：',
      quit_tenant: '次のテナントを退出しようとしています：',
      quit_tenant_other: '次のテナントを退出しようとしています：',
    },
    issues: {
      paid_plan: '次のテナントは有料プランです。まずサブスクリプションをキャンセルしてください：',
      paid_plan_other:
        '次のテナントは有料プランです。まずサブスクリプションをキャンセルしてください：',
      subscription_status: '次のテナントにサブスクリプションの問題があります：',
      subscription_status_other: '次のテナントにサブスクリプションの問題があります：',
      open_invoice: '次のテナントに未払いの請求書があります：',
      open_invoice_other: '次のテナントに未払いの請求書があります：',
    },
    error_occurred: 'エラーが発生しました',
    error_occurred_description: '申し訳ありませんが、アカウントの削除中に問題が発生しました：',
    request_id: 'リクエスト ID：{{requestId}}',
    try_again_later:
      '後でもう一度試してください。問題が解決しない場合は、リクエスト ID を持って Logto チームに連絡してください。',
    final_confirmation: '最終確認',
    about_to_start_deletion: '削除プロセスを開始しようとしています。この操作は元に戻せません。',
    permanently_delete: '完全に削除',
  },

  fields: {
    name: '名前',
    name_description: '表示可能な形式のユーザーのフルネーム（例: "Jane Doe"）。',
    avatar: 'アバター',
    avatar_description: 'ユーザーのアバター画像のURL。',
    familyName: '姓',
    familyName_description: 'ユーザーの姓または名字（例: "Doe"）。',
    givenName: '名',
    givenName_description: 'ユーザーの名またはファーストネーム（例: "Jane"）。',
    middleName: 'ミドルネーム',
    middleName_description: 'ユーザーのミドルネーム（例: "Marie"）。',
    nickname: 'ニックネーム',
    nickname_description:
      'ユーザーのカジュアルまたは親しみやすい名前で、法的な名前とは異なる場合があります。',
    preferredUsername: '希望ユーザー名',
    preferredUsername_description: 'ユーザーが参照されることを望む短縮識別子。',
    profile: 'プロフィール',
    profile_description:
      'ユーザーの人間が読めるプロフィールページのURL（例: ソーシャルメディアプロフィール）。',
    website: 'ウェブサイト',
    website_description: 'ユーザーの個人ウェブサイトまたはブログのURL。',
    gender: '性別',
    gender_description: 'ユーザーが自己識別する性別（例: "女性"、"男性"、"ノンバイナリー"）。',
    birthdate: '生年月日',
    birthdate_description: '指定された形式のユーザーの生年月日（例: "MM-dd-yyyy"）。',
    zoneinfo: 'タイムゾーン',
    zoneinfo_description:
      'IANA形式のユーザーのタイムゾーン（例: "America/New_York" または "Europe/Paris"）。',
    locale: '言語',
    locale_description: 'IETF BCP 47形式のユーザーの言語（例: "en-US" または "zh-CN"）。',
    address: {
      formatted: '住所',
      streetAddress: '番地',
      locality: '市区町村',
      region: '都道府県',
      postalCode: '郵便番号',
      country: '国',
    },
    address_description:
      '表示可能な形式のユーザーの完全な住所（例: "123 Main St, Anytown, USA 12345"）。',
    fullname: 'フルネーム',
    fullname_description: '設定に基づいて姓、名、ミドルネームを柔軟に組み合わせたもの。',
  },
};

export default Object.freeze(profile);
