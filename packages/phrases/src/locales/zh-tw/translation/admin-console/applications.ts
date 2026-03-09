const applications = {
  page_title: '全部應用',
  title: '全部應用',
  subtitle: '創建一個移動、單頁、machine-to-machine 或傳統 web 應用程序，並通過 Logto 進行身份驗證',
  subtitle_with_app_type: '設置 {{name}} 應用程序的 Logto 身份驗證',
  create_device_flow_description:
    '建立一個使用 OAuth 2.0 裝置授權許可的原生應用程式，適用於輸入受限裝置或無頭應用程式。',
  create: '創建應用',
  create_third_party: '創建第三方應用',
  create_thrid_party_modal_title: '創建第三方應用（{{type}}）',
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
  app_id: 'App ID',
  type: {
    native: {
      title: '原生應用',
      subtitle: '在原生環境中運行的應用程序',
      description: '例如 iOS 應用程式、Android 應用程式、桌面應用程式、電視、CLI',
    },
    spa: {
      title: '單頁應用',
      subtitle: '在瀏覽器中運行並動態更新數據的應用程式',
      description: '例如 React DOM 應用程式，Vue 應用程式',
    },
    traditional: {
      title: '傳統網頁應用',
      subtitle: '僅由 Web 伺服器渲染和更新的應用程式',
      description: '例如 Next.js，PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: '直接與資源對話的應用程式（通常是服務）',
      description: '例如，後端服務',
    },
    protected: {
      title: '受保護應用',
      subtitle: '受 Logto 保護的應用',
      description: 'N/A',
    },
    saml: {
      title: 'SAML 應用',
      subtitle: '用作 SAML IdP 連接器的應用',
      description: '例如，SAML',
    },
    third_party: {
      title: '第三方應用程式',
      subtitle: '作為第三方 IdP 連接器使用的應用程式',
      description: '例如，OIDC、SAML',
    },
  },
  authorization_flow: {
    title: '授權流程',
    tooltip: '選擇應用程式的授權流程。一旦設定，將無法更改。',
    authorization_code: {
      title: 'Authorization code',
      description: '預設且最常見的授權類型。使用者將被重新導向到登入頁面以直接授權存取。',
    },
    device_flow: {
      title: 'Device flow',
      description:
        '適用於輸入受限的裝置或無介面應用程式（如電視、CLI）。使用者在另一台裝置上透過輸入裝置碼或掃描 QR 碼完成登入。',
    },
  },
  placeholder_title: '選擇應用程式類型以繼續',
  placeholder_description:
    'Logto 使用 OIDC 的應用程式實體來幫助識別你的應用程式、管理登入和創建審計日誌等任務。',
  third_party_application_placeholder_description:
    '使用 Logto 作為身份提供者來提供對第三方服務的 OAuth 授權。 \n 包括用於資源訪問的預建用戶同意屏幕。<a>了解更多</a>',
  guide: {
    third_party: {
      title: '整合第三方應用',
      description:
        '使用 Logto 作為身份提供者為第三方服務提供 OAuth 授權。包含用於安全資源訪問的預建用戶同意畫面。<a>了解更多</a>',
    },
  },
};

export default Object.freeze(applications);
