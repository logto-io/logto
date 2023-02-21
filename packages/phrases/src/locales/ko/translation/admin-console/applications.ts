const applications = {
  title: '어플리케이션',
  subtitle:
    '인증에 Logto를 사용할 모바일, 단일 페이지, machine to machine 또는 기존 어플리케이션을 설정할 수 있어요.',
  create: '어플리케이션 생성',
  application_name: '어플리케이션 이름',
  application_name_placeholder: '나의 앱',
  application_description: '어플리케이션 설명',
  application_description_placeholder: '어플리케이션 설명을 적어주세요.',
  select_application_type: '어플리케이션 종류 선택',
  no_application_type_selected: '어플리케이션 종류를 선택하지 않았어요.',
  application_created:
    '{{name}} 어플리케이션이 성공적으로 생성되었어요! \n이제 어플리케이션 설정을 마무리해 주세요.',
  app_id: '앱 ID',
  type: {
    native: {
      title: 'Native App',
      subtitle: 'Native 환경에서 작동하는 어플리케이션',
      description: '예) iOS, Android 앱',
    },
    spa: {
      title: 'Single Page App',
      subtitle: '웹 브라우저에서 작동하며, 한 페이지에서 유동적으로 업데이트 되는 웹',
      description: '예) React DOM, Vue 앱',
    },
    traditional: {
      title: 'Traditional Web',
      subtitle: '서버를 통하여 웹 페이지가 업데이트 되는 앱',
      description: '예) JSP, PHP',
    },
    machine_to_machine: {
      title: 'Machine to Machine',
      subtitle: '직접 리소스에 접근하는 엡(서비스)',
      description: '예) 백엔드 서비스',
    },
  },
  guide: {
    get_sample_file: '예제 찾기',
    header_description:
      '단계별 가이드에 따라 어플리케이션을 연동하거나, 오른쪽 버튼을 클릭하여 샘플 프로젝트를 받아 보세요.',
    title: '어플리케이션이 생성되었어요.',
    subtitle: '앱 설정을 마치기 위해 아래 단계를 따라주세요. SDK 종류를 선택해 주세요.',
    description_by_sdk: '아래 과정을 따라서 Logto를 {{sdk}} 앱과 빠르게 연동해 보세요.',
  },
};

export default applications;
