const custom_profile_fields = {
  table: {
    add_button: 'プロフィールフィールドを追加',
    title: {
      field_label: 'フィールドラベル',
      type: 'タイプ',
      user_data_key: 'ユーザーデータキー',
    },
    placeholder: {
      title: 'ユーザープロフィールを収集',
      description: 'サインアップ時に収集するユーザープロフィール情報をカスタマイズします。',
    },
  },
  type: {
    Text: 'テキスト',
    Number: '数値',
    Date: '日付',
    Checkbox: 'チェックボックス (ブール値)',
    Select: 'ドロップダウン (単一選択)',
    Url: 'URL',
    Regex: '正規表現',
    Address: '住所 (複合)',
    Fullname: '氏名 (複合)',
  },
  modal: {
    title: 'プロフィールフィールドを追加',
    subtitle: 'サインアップ時に収集するユーザープロフィール情報をカスタマイズします。',
    built_in_properties: '基本ユーザーデータ',
    custom_properties: 'カスタムユーザーデータ',
    custom_data_field_name: 'ユーザーデータキー',
    custom_data_field_input_placeholder:
      'ユーザーデータキーを入力してください。例: `myFavoriteFieldName`',
    custom_field: {
      title: 'カスタムデータ',
      description:
        'アプリケーションの独自の要件を満たすために定義できる追加のユーザープロパティです。',
    },
    type_required: 'プロパティタイプを選択してください',
    create_button: 'プロフィールフィールドを作成',
  },
  details: {
    page_title: 'プロフィールフィールドの詳細',
    back_to_sie: 'サインイン体験に戻る',
    enter_field_name: 'プロフィールフィールド名を入力してください',
    delete_description:
      'この操作は取り消せません。このプロフィールフィールドを削除してもよろしいですか？',
    field_deleted: 'プロフィールフィールド {{name}} が正常に削除されました。',
    key: 'ユーザーデータキー',
    field_name: 'フィールド名',
    field_type: 'フィールドタイプ',
    settings: '設定',
    settings_description: 'サインアップ時に収集するユーザープロフィール情報をカスタマイズします。',
    address_format: '住所フォーマット',
    single_line_address: '1行の住所',
    multi_line_address: '複数行の住所 (例: 番地、市区町村、都道府県、郵便番号、国)',
    components: 'コンポーネント',
    components_tip: '複合フィールドを構成するコンポーネントを選択します。',
    label: 'フィールドラベル',
    label_placeholder: 'ラベル',
    label_tip: '多言語対応が必要ですか？<a>サインイン体験 > コンテンツ</a>で言語を追加してください',
    label_tooltip:
      'フィールドの目的を示すフローティングラベル。入力内に表示され、フォーカスまたは値入力でフィールド上部へ移動します。',
    placeholder: 'フィールドプレースホルダー',
    placeholder_placeholder: 'プレースホルダー',
    placeholder_tooltip:
      '入力欄内に表示される簡潔な例または形式ヒント。ラベルがフロートした後に現れることが多く、短く保ってください（例: MM/DD/YYYY）。',
    description: 'フィールド説明',
    description_placeholder: '説明',
    description_tooltip:
      'テキストフィールド下に表示される補助テキスト。詳細な手順やアクセシビリティの注意書きに使用します。',
    options: 'オプション',
    options_tip:
      '各オプションを新しい行に入力します。形式は value:label（例: red:Red）。value だけでも入力できます。label を省略した場合は value がラベルとして表示されます。',
    options_placeholder: 'value1:label1\nvalue2:label2\nvalue3:label3',
    regex: '正規表現',
    regex_tip: '入力値を検証する正規表現を定義します。',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: '日付フォーマット',
    date_format_us: 'MM/dd/yyyy (例：アメリカ合衆国)',
    date_format_uk: 'dd/MM/yyyy (例：英国およびヨーロッパ)',
    date_format_iso: 'yyyy-MM-dd (国際標準)',
    custom_date_format: 'カスタム日付フォーマット',
    custom_date_format_placeholder: 'カスタム日付フォーマットを入力してください。例: "MM-dd-yyyy"',
    custom_date_format_tip:
      '有効なフォーマットトークンについては<a>date-fns</a>ドキュメントを参照してください。',
    input_length: '入力長',
    value_range: '値の範囲',
    min: '最小値',
    max: '最大値',
    default_value: 'デフォルト値',
    checkbox_checked: 'チェック済み (True)',
    checkbox_unchecked: 'チェックなし (False)',
    required: '必須',
    required_description:
      '有効にすると、このフィールドはユーザーによって入力される必要があります。無効にすると、このフィールドはオプションです。',
  },
};

export default Object.freeze(custom_profile_fields);
