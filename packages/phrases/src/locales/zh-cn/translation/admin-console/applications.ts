const applications = {
  title: '全部应用',
  subtitle: '创建一个移动、单页、machine to machine 或传统 web 应用程序，并通过 Logto 进行身份验证',
  create: '创建应用',
  application_name: '应用名称',
  application_name_placeholder: '我的应用',
  application_description: '应用描述',
  application_description_placeholder: '请输入应用描述',
  select_application_type: '选择应用类型',
  no_application_type_selected: '你还没有选择应用类型',
  application_created: '应用 {{name}} 成功创建! \n现在请完成你的应用设置。',
  app_id: 'App ID',
  type: {
    native: {
      title: '原生应用',
      subtitle: '在原生环境中运行的应用程序',
      description: '例如 iOS app，Android app',
    },
    spa: {
      title: '单页应用',
      subtitle: '在浏览器中运行并动态更新数据的应用程序',
      description: '例如 React DOM app，Vue app',
    },
    traditional: {
      title: '传统网页应用',
      subtitle: '仅由 Web 服务器渲染和更新的应用程序',
      description: '例如 Next.js, PHP',
    },
    // UNTRANSLATED
    machine_to_machine: {
      title: 'Machine to Machine',
      subtitle: 'An app (usually a service) that directly talks to resources',
      description: 'E.g., Backend service',
    },
  },
  guide: {
    get_sample_file: '获取示例',
    header_description:
      '参考如下教程，将 Logto 集成到你的应用中。你也可以点击右侧按钮，获取我们为你准备好的示例工程。',
    title: '应用创建成功',
    subtitle: '参考以下步骤完成你的应用设置。首先，选择你要使用的 SDK 类型：',
    description_by_sdk: '本教程向你演示如何在 {{sdk}} 应用中集成 Logto 登录功能',
  },
  placeholder_title: 'Select an application type to continue', // UNTRANSLATED
  placeholder_description:
    'Logto uses an application entity for OIDC to help with tasks such as identifying your apps, managing sign-in, and creating audit logs.', // UNTRANSLATED
};

export default applications;
