const role = {
  name_in_use: 'このロール名{{name}}はすでに使用されています',
  scope_exists: 'スコープID {{scopeId}}はすでにこのロールに追加されています',
  management_api_scopes_not_assignable_to_user_role:
    'ユーザーのロールに管理APIのスコープを割り当てることはできません。',
  user_exists: 'ユーザーID{{userId}}はすでにこのロールに追加されています',
  application_exists: 'アプリケーション ID {{applicationId}} はすでにこのロールに追加されています',
  default_role_missing:
    'データベースにデフォルトロール名が存在しないものがあります。ロールを作成してください',
  internal_role_violation:
    'Logtoによって許可されていない内部ロールの更新または削除を試みている可能性があります。新しいロールを作成する場合は、「#internal：」で始まる別の名前を試してください。',
};

export default Object.freeze(role);
