const api_resource_details = {
  back_to_api_resources: 'API 리소스로 돌아가기',
  settings_tab: 'Settings', // UNTRANSLATED
  permission_tab: 'Permission', // UNTRANSLATED
  settings: '설정',
  settings_description:
    'API 리소스(리소스 표시기) - 요청할 대상 서비스 또는 리소스(일반적으로 리소스의 ID를 나타내는 URI 형식 변수)를 나타냅니다.',
  token_expiration_time_in_seconds: '토큰 만료 시간 (초)',
  token_expiration_time_in_seconds_placeholder: '토큰 만료 시간을 입력해주세요',
  delete_description:
    '이 행동은 취소될 수 없어요. 해당 API 리소스가 영원히 삭제될거예요. 삭제를 하기 위해 API 리소스 이름 "<span>{{name}}</span>"을 입력해주세요.',
  enter_your_api_resource_name: 'API 리소스 이름을 입력해주세요.',
  api_resource_deleted: '{name}} API 리소스가 성공적으로 삭제되었어요.',
  permission: {
    create_button: 'Create Permission', // UNTRANSLATED
    create_title: 'Create permission', // UNTRANSLATED
    create_subtitle: 'Define the permissions (scopes) needed by this API.', // UNTRANSLATED
    confirm_create: 'Create permission', // UNTRANSLATED
    name: 'Permission name', // UNTRANSLATED
    name_placeholder: 'Read:Resources', // UNTRANSLATED
    description: 'Description', // UNTRANSLATED
    description_placeholder: 'Able to read the resources', // UNTRANSLATED
    permission_created: 'The permission {{name}} has been successfully created', // UNTRANSLATED
    delete_description:
      'If this permission is deleted, the user who had this permission will lose the access granted by it.', // UNTRANSLATED
    deleted: 'The permission "{{name}}" was successfully deleted!', // UNTRANSLATED
  },
};

export default api_resource_details;
