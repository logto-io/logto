const custom_profile_fields = {
  entity_not_exists_with_names: '指定された名前のエンティティが見つかりません: {{names}}',
  invalid_min_max_input: '最小値と最大値の入力が無効です。',
  invalid_options: 'フィールドオプションが無効です。',
  invalid_regex_format: '正規表現の形式が無効です。',
  invalid_address_parts: '住所の構成要素が無効です。',
  invalid_fullname_parts: '氏名の構成要素が無効です。',
  name_exists: '指定された名前のフィールドはすでに存在します。',
  conflicted_sie_order: 'サインイン体験のフィールド順序の値が重複しています。',
  invalid_name:
    'フィールド名が無効です。文字または数字のみが許可され、大文字小文字が区別されます。',
  name_conflict_sign_in_identifier:
    '無効なフィールド名です。"{{name}}" は予約されたサインイン識別子キーです。',
  name_conflict_custom_data:
    '無効なフィールド名です。"{{name}}" は予約されたカスタムデータキーです。',
  name_required: 'フィールド名は必須です。',
};

export default Object.freeze(custom_profile_fields);
