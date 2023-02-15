const api_resource_details = {
  back_to_api_resources: 'API 리소스로 돌아가기',
  settings_tab: '설정',
  permissions_tab: '권한',
  settings: '설정',
  settings_description:
    'API 리소스(리소스 표시기) - 요청할 대상 서비스 또는 리소스(일반적으로 리소스의 ID를 나타내는 URI 형식 변수)를 나타내요.',
  token_expiration_time_in_seconds: '토큰 만료 시간 (초)',
  token_expiration_time_in_seconds_placeholder: '토큰 만료 시간을 입력해주세요',
  delete_description:
    '이 행동은 취소할 수 없어요. 해당 API 리소스가 영원히 삭제될 거예요. 삭제를 하기 위해 API 리소스 이름 "<span>{{name}}</span>"을 입력해주세요.',
  enter_your_api_resource_name: 'API 리소스 이름을 입력해주세요.',
  api_resource_deleted: '{name}} API 리소스가 성공적으로 삭제되었어요.',
  permission: {
    create_button: '권한 생성',
    create_title: '권한 생성',
    create_subtitle: '이 API에 필요한 권한을 정의해요.',
    confirm_create: '권한 생성',
    name: '권한 이름',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: '권한 이름은 공백을 포함할 수 없어요.',
    description: '설명',
    description_placeholder: '리소스를 볼 수 있는 권한',
    permission_created: '권한 {{name}}이 성공적으로 생성되었어요.',
    delete_description:
      '이 권한이 삭제되면, 이 권한을 가지고 있던 사용자는 이 권한에 의해 부여받은 접근 권한을 잃게 돼요.',
    deleted: '권한 "{{name}}"이 성공적으로 삭제되었어요.',
  },
};

export default api_resource_details;
