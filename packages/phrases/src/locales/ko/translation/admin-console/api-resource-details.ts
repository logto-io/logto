const api_resource_details = {
  page_title: 'API 리소스 세부 정보',
  back_to_api_resources: 'API 리소스로 돌아가기',
  general_tab: '일반',
  permissions_tab: '권한',
  settings: '설정',
  settings_description:
    'API 리소스(리소스 표시기) - 요청할 대상 서비스 또는 리소스(일반적으로 리소스의 ID를 나타내는 URI 형식 변수)를 나타냅니다.',
  management_api_settings_description:
    'Logto 관리 API는 관리자가 다양한 ID 관련 작업을 관리하고 보안 정책을 시행하며 규정 및 표준을 준수할 수 있도록 하는 포괄적인 API 컬렉션입니다.',
  management_api_notice:
    '이 API는 Logto 엔터티를 나타내며 수정 또는 삭제할 수 없습니다. 다양한 ID 관련 작업에 대해 관리 API를 사용할 수 있습니다. <a>더 알아보기</a>',
  token_expiration_time_in_seconds: '토큰 만료 시간 (초)',
  token_expiration_time_in_seconds_placeholder: '토큰 만료 시간을 입력해주세요',
  delete_description:
    '이 동작은 취소할 수 없습니다. 해당 API 리소스는 영원히 삭제됩니다. 삭제를 위해 API 리소스 이름 "<span>{{name}}</span>"을 입력해주세요.',
  enter_your_api_resource_name: 'API 리소스 이름을 입력해주세요.',
  api_resource_deleted: '{{name}} API 리소스가 성공적으로 삭제되었습니다.',
  permission: {
    create_button: '권한 생성',
    create_title: '권한 생성',
    create_subtitle: '이 API에 필요한 권한을 정의합니다.',
    confirm_create: '권한 생성',
    edit_title: '권한 편집',
    edit_subtitle: 'Define the permissions (scopes) needed by the {{resourceName}} API.',
    name: '권한 이름',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: '권한 이름에는 공백을 포함할 수 없습니다.',
    description: '설명',
    description_placeholder: '리소스를 볼 수 있는 권한',
    permission_created: '{{name}} 권한이 성공적으로 생성되었습니다.',
    delete_description:
      '이 권한이 삭제되면, 해당 권한을 가진 사용자는 해당 권한으로 인해 부여받은 접근 권한을 상실하게 됩니다.',
    deleted: '권한 "{{name}}"이 성공적으로 삭제되었습니다.',
  },
};

export default Object.freeze(api_resource_details);
