# QQ社交连接器

QQ社交登录 Logto 官方连接器 [English Documentation](https://github.com/logto-io/logto/tree/master/packages/connectors/connector-qq/README.en.md)

**目录**

- [QQ社交连接器](#qq社交连接器)
  - [开始上手](#开始上手)
  - [配置QQ Connect应用](#配置qq-connect应用)
  - [权限要求](#权限要求)
  - [测试QQ连接器](#测试qq连接器)
  - [参考](#参考)

QQ是腾讯旗下的社交平台，拥有超过6亿用户。本连接器可以帮助终端用户使用QQ账号登录你的应用。

## 开始上手

1. 在[QQ互联平台](https://connect.qq.com/)创建开发者账号
2. 访问[应用管理](https://connect.qq.com/manage.html)
3. 创建一个新应用（如果还没有）

## 配置QQ Connect应用

1. 访问[应用管理](https://connect.qq.com/manage.html)
2. 配置应用设置:
   - 打开要用于登录的应用，点击「应用信息」
   - 添加「网站地址」: `logto_endpoint`
   - 添加「网站回调域」: `${logto_endpoint}/callback/${connector_id}`
3. 从应用信息页获取 `APP ID` 和 `APP Key`
4. 将第 3 步获取的值填入 Logto 管理控制台的 `clientId` 和 `clientSecret` 字段

## 权限要求

使用此连接器需要在QQ互联平台申请以下权限：

1. **UnionID权限**：必须申请`UnionID`接口调用权限，这确保我们能获取用户的唯一标识。
   请通过[QQ互联平台](https://connect.qq.com/)申请此权限。

2. **默认scope**：`get_user_info`
   用于获取用户的基本信息，如昵称、头像等。
   默认情况下，如果不设置scope参数，系统会使用此权限。

## 测试QQ连接器

大功告成！别忘了在[登录体验](https://{logto_endpoint}/console/connectors/social)中启用该连接器。

## 参考

- [QQ Connect 接入指南](https://wiki.connect.qq.com/%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C_oauth2-0)
- [QQ开放平台API文档](https://wiki.connect.qq.com/)