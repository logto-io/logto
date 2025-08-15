const custom_profile_fields = {
  entity_not_exists_with_names: '指定された名前のエンティティが見つかりません: {{names}}',
  invalid_min_max_input: '最小値と最大値の入力が無効です。',
  invalid_default_value: 'デフォルト値が無効です。',
  invalid_options: 'フィールドオプションが無効です。',
  invalid_regex_format: '正規表現の形式が無効です。',
  invalid_address_components: '住所のコンポーネントが無効です。',
  invalid_fullname_components: '氏名のコンポーネントが無効です。',
  invalid_sub_component_type: 'サブコンポーネントタイプが無効です。',
  name_exists: '指定された名前のフィールドはすでに存在します。',
  conflicted_sie_order: 'サインイン体験のフィールド順序の値が重複しています。',
  invalid_name:
    'フィールド名が無効です。文字または数字のみが許可され、大文字小文字が区別されます。',
  name_conflict_sign_in_identifier:
    '無効なフィールド名です。予約済みのサインイン識別子キー: {{name}}。',
  name_conflict_built_in_prop:
    '無効なフィールド名です。予約済みの組み込みユーザープロフィールのプロパティ名: {{name}}。',
  name_conflict_custom_data: '無効なフィールド名です。予約済みのカスタムデータキー: {{name}}。',
  name_required: 'フィールド名は必須です。',
};

export default Object.freeze(custom_profile_fields);
