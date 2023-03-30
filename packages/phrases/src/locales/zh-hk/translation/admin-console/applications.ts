const applications = {
  page_title: '全部應用',
  title: '全部應用',
  subtitle: '創建一個移動、單頁、machine to machine 或傳統 web 應用程序，並通過 Logto 進行身份驗證',
  create: '創建應用',
  application_name: '應用名稱',
  application_name_placeholder: '我的應用',
  application_description: '應用描述',
  application_description_placeholder: '請輸入應用描述',
  select_application_type: '選擇應用類型',
  no_application_type_selected: '你還沒有選擇應用類型',
  application_created: '應用 {{name}} 成功創建! \n現在請完成你的應用設置。',
  app_id: 'App ID',
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
      title: '機器對機器',
      subtitle: '直接與資源對話的應用程序（通常是服務）',
      description: '例如，後端服務',
    },
  },
  guide: {
    get_sample_file: '獲取示例',
    header_description:
      '參考如下教程，將 Logto 集成到你的應用中。你也可以點擊右側按鈕，獲取我們為你準備好的示例工程。',
    title: '應用創建成功',
    subtitle: '參考以下步驟完成你的應用設置。首先，選擇你要使用的 SDK 類型：',
    description_by_sdk: '本教程向你演示如何在 {{sdk}} 應用中集成 Logto 登錄功能',
  },
  placeholder_title: '選擇應用程序類型以繼續',
  placeholder_description:
    'Logto 使用 OIDC 的應用程序實體來幫助識別你的應用程序、管理登錄和創建審計日誌等任務。',
};

export default applications;
