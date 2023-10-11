const tenants = {
  title: '설정',
  description: '테넌트 설정을 효율적으로 관리하고 도메인을 사용자 정의합니다.',
  tabs: {
    settings: '설정',
    domains: '도메인',
    subscription: '요금제와 청구',
    billing_history: '청구 내역',
  },
  settings: {
    title: '설정',
    tenant_id: '테넌트 ID',
    tenant_name: '테넌트 이름',
    environment_tag: '환경 태그',
    environment_tag_description:
      '태그는 서비스를 변경하지 않습니다. 단지 다양한 환경을 구별하는 데 도움을 줍니다.',
    environment_tag_development: '개발',
    environment_tag_staging: '스테이징',
    environment_tag_production: '프로드',
    tenant_info_saved: '세입자 정보가 성공적으로 저장되었습니다.',
  },
  deletion_card: {
    title: '삭제',
    tenant_deletion: '테넌트 삭제',
    tenant_deletion_description:
      '테넌트를 삭제하면 관련된 모든 사용자 데이터와 설정이 영구적으로 삭제됩니다. 신중하게 진행해주십시오.',
    tenant_deletion_button: '테넌트 삭제',
  },
  create_modal: {
    title: '테넌트 만들기',
    subtitle: '자원 및 사용자를 분리하기 위한 새 테넌트를 만드세요.',
    create_button: '테넌트 만들기',
    tenant_name_placeholder: '내 테넌트',
  },
  delete_modal: {
    title: '테넌트 삭제',
    description_line1:
      '환경 접미사 "<span>{{tag}}</span>"이(가) 붙은 "<span>{{name}}</span>" 테넌트를 삭제하시겠습니까? 이 작업은 실행 취소할 수 없으며, 모든 데이터 및 계정 정보가 영구적으로 삭제됩니다.',
    description_line2:
      '계정을 삭제하기 전에 도움이 필요할 수 있습니다. <span><a>이메일로 연락</a></span>해주시면 도움을 드리겠습니다.',
    description_line3:
      '삭제하려는 테넌트 이름 "<span>{{name}}</span>"을(를) 입력하여 확인하십시오.',
    delete_button: '영구 삭제',
  },
  tenant_landing_page: {
    title: '아직 테넌트를 만들지 않았습니다.',
    description:
      'Logto 를 사용하여 프로젝트를 구성하려면 새 테넌트를 만드세요. 로그아웃하거나 계정을 삭제하려면 오른쪽 상단 모서리에있는 아바타 버튼을 클릭하세요.',
    create_tenant_button: '테넌트 만들기',
  },
  status: {
    mau_exceeded: 'MAU 초과',
    suspended: '정지됨',
    overdue: '만료',
  },
  tenant_suspended_page: {
    title: '테넌트 정지. 접근을 복구하려면 문의하세요.',
    description_1:
      '매우 유감스럽게도 테넌트 계정이 일시적으로 정지되었으며, MAU 한도 초과, 연체된 결제 또는 다른 무단 조치 등 부적절한 사용으로 인한 것입니다.',
    description_2:
      '자세한 설명이 필요한 경우, 우려 사항이 있거나 기능을 완전히 복원하고 테넌트를 차단 해제하려면 바로 연락 주시기 바랍니다.',
  },
  signing_keys: {
    /** UNTRANSLATED */
    title: 'SIGNING KEYS',
    /** UNTRANSLATED */
    description: 'Securely manage signing keys in your tenant.',
    type: {
      /** UNTRANSLATED */
      private_key: 'OIDC private keys',
      /** UNTRANSLATED */
      cookie_key: 'OIDC cookie keys',
    },
    /** UNTRANSLATED */
    private_keys_in_use: 'Private keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This will rotate the currently used private keys. Your {{entities}} with previous private keys will stay valid until you delete it.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for private keys',
    /** UNTRANSLATED */
    rotate_button: 'Rotate',
    table_column: {
      /** UNTRANSLATED */
      id: 'ID',
      /** UNTRANSLATED */
      status: 'Status',
      /** UNTRANSLATED */
      algorithm: 'Signing key algorithm',
    },
    status: {
      /** UNTRANSLATED */
      current: 'Current',
      /** UNTRANSLATED */
      previous: 'Previous',
    },
    reminder: {
      /** UNTRANSLATED */
      rotate:
        'Are you sure you want to rotate the <strong>{{key}}</strong>? This will require all your apps and APIs to use the new signing key. Existing {{entities}} stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete:
        'Are you sure you want to delete the <strong>{{key}}</strong>? Existing {{entities}} signed with this signing key will no longer be valid.',
    },
    signed_entity: {
      /** UNTRANSLATED */
      tokens: 'JWT tokens',
      /** UNTRANSLATED */
      cookies: 'cookies',
    },
  },
};

export default Object.freeze(tenants);
