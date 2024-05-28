const applications = {
  page_title: '全部應用',
  title: '全部應用',
  subtitle: '創建一個移動、單頁、machine-to-machine 或傳統 web 應用程序，並通過 Logto 進行身份驗證',
  subtitle_with_app_type: '為你的 {{name}} 應用程序設置 Logto 身份驗證',
  create: '創建應用',
  create_subtitle_third_party: '使用 Logto 作為您的身份提供者（IdP）輕鬆與第三方應用程序集成',
  application_name: '應用名稱',
  application_name_placeholder: '我的應用',
  application_description: '應用描述',
  application_description_placeholder: '請輸入應用描述',
  select_application_type: '選擇應用類型',
  no_application_type_selected: '你還沒有選擇應用類型',
  application_created: '應用創建成功。',
  tab: {
    my_applications: '我的應用',
    third_party_applications: '第三方應用程式',
  },
  app_id: '應用程式 ID',
  type: {
    native: {
      title: '原生應用',
      subtitle: '在原生環境中運行的應用程序',
      description: '例如 iOS app，Android app',
    },
    spa: {
      title: '單頁應用',
      subtitle: '在瀏覽器中運行並動態更新數據的應用程序',
      description: '例如 React DOM app，Vue app',
    },
    traditional: {
      title: '傳統網頁應用',
      subtitle: '僅由 Web 服務器渲染和更新的應用程序',
      description: '例如 Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: '直接與資源對話的應用程序（通常是服務）',
      description: '例如，後端服務',
    },
    protected: {
      title: '受保護應用程序',
      subtitle: '透過 Logto 保護的應用程序',
      description: 'N/A',
    },
    third_party: {
      title: '第三方應用程序',
      subtitle: '作為第三方 IdP 連接器使用的應用程序',
      description: '例如 OIDC，SAML',
    },
  },
  placeholder_title: '選擇應用程式類型以繼續',
  placeholder_description:
    'Logto 使用 OIDC 的應用程式實體來幫助識別您的應用程式、管理登錄和創建審核日誌等任務。',
};

export default Object.freeze(applications);
