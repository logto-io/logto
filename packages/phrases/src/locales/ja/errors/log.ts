const log = {
  invalid_type: 'ログタイプが無効です。',
  invalid_time_window: '`end_time` は `start_time` より後である必要があります。',
  cleanup_boundary_in_future: '`end_time` に未来の時刻は指定できません。',
};

export default Object.freeze(log);
