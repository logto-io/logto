import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  CreateConnector,
  GetAuthorizationUri,
  GetConnectorConfig,
  GetUserInfo,
  SocialConnector,
} from "@logto/connector-kit";
import { metadata } from "./metadata";
import { Config, configGuard } from "./config-guard";
import { z } from "zod";

/**
 * WeChat mini program code to session endpoint.
 */
const codeToSessionEndpoint = "https://api.weixin.qq.com/sns/jscode2session";

/**
 * WeChat code to session response.
 */
const codeToSessionResponse = z.union([
  z.object({
    errcode: z.number(),
    errmsg: z.string(),
  }),
  z.object({
    openid: z.string(),
    unionid: z.string().optional(),
  }),
]);

/**
 * WeChat mini program get user info data.
 */
const userInfoData = z.object({
  code: z.string(),
});

/**
 * WeChat mini program connector get authorization URL.
 */
const getAuthorizationUri: GetAuthorizationUri = async (payload) =>
  payload.redirectUri;

/**
 * Create WeChat mini program `getUserInfo` function.
 */
const createGetUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data: unknown) => {
    const result = userInfoData.safeParse(data);
    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, result.error);
    }

    const { code } = result.data;
    const { appid, secret, mode } = (await getConfig(metadata.id)) as Config;
    const url = `${codeToSessionEndpoint}?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    const res = await fetch(url, { method: "GET" }).then((res) => res.json());
    const parsed = codeToSessionResponse.parse(res);

    if ("errcode" in parsed && parsed.errcode !== 0) {
      throw new ConnectorError(
        ConnectorErrorCodes.SocialAuthCodeInvalid,
        parsed.errmsg
      );
    }

    const { openid, unionid } = parsed as { openid: string; unionid: string };
    switch (mode) {
      case "openid":
        return { id: openid };
      case "unionid":
        return { id: unionid };
    }
  };

/**
 * Create WeChat mini program connector.
 */
const createWeChatMiniProgramConnectior: CreateConnector<
  SocialConnector
> = async ({ getConfig }) => ({
  type: ConnectorType.Social,
  metadata,
  configGuard,
  getAuthorizationUri,
  getUserInfo: createGetUserInfo(getConfig),
});

/**
 * Logto WeChat mini program connector entry.
 */
export default createWeChatMiniProgramConnectior;
