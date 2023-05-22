import {
  ConnectorConfigFormItemType,
  ConnectorMetadata,
  ConnectorPlatform,
} from "@logto/connector-kit";

export const metadata: ConnectorMetadata = {
  id: "wechat-miniprogram",
  target: "wechat",
  platform: ConnectorPlatform.Native,
  name: {
    en: "WeChat",
    zh: "微信",
  },
  logo: "./logo.svg",
  logoDark: null,
  description: {
    en: "WeChat mini program connector.",
    zh: "微信小程序连接器。",
  },
  readme: "./README.md",
  formItems: [
    {
      key: "appid",
      label: "App ID",
      type: ConnectorConfigFormItemType.Text,
      placeholder: "WeChat mini program app ID",
      required: true,
    },
    {
      key: "secret",
      label: "Secret",
      type: ConnectorConfigFormItemType.Text,
      placeholder: "WeChat mini program app secret",
      required: true,
    },
    {
      key: "mode",
      label: "Identifier Mode",
      type: ConnectorConfigFormItemType.Select,
      selectItems: [
        {
          title: "Open ID",
          value: "openid",
        },
        {
          title: "Union ID",
          value: "unionid",
        },
      ],
      defaultValue: "openid",
    },
  ],
};
