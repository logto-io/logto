const concurrent_device_limit = {
  title: '동시 기기 제한',
  description: '사용자가 이 앱에 대해 로그인할 수 있는 기기 수를 제어합니다.',
  enable: '동시 기기 제한 활성화',
  enable_description: '활성화되면 Logto 는 이 앱에 대한 사용자당 최대 활성 허용을 시행합니다.',
  field: '앱당 동시 기기 제한',
  field_description:
    '사용자가 동시에 로그인할 수 있는 기기 수를 제한합니다. Logto 는 활성 허용을 제한하고 제한을 초과할 경우 가장 오래된 허용을 자동으로 해제하여 이를 시행합니다.',
  field_placeholder: '제한 없음으로 하려면 비워 두세요.',
  should_be_greater_than_zero: '0보다 커야 합니다.',
};

export default Object.freeze(concurrent_device_limit);
