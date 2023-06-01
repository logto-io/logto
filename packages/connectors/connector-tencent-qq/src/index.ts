import {assert} from '@silverhand/essentials';
import {got, HTTPError} from 'got';

import type {
    CreateConnector,
    GetAuthorizationUri,
    GetConnectorConfig,
    GetUserInfo,
    SocialConnector,
} from '@logto/connector-kit';
import {ConnectorError, ConnectorErrorCodes, ConnectorType, parseJson, validateConfig,} from '@logto/connector-kit';

import {
    accessTokenEndpoint,
    authorizationEndpoint,
    defaultMetadata,
    defaultTimeout,
    openIdEndpoint,
    scope as defaultScope,
    userInfoEndpoint,
} from './constant.js';
import type {GetAccessTokenErrorHandler, QQConfig, UserInfoResponseMessageParser,} from './types.js';
import {
    accessTokenResponseGuard,
    authResponseGuard,
    openIdResponseGuard,
    qqConfigGuard,
    userInfoResponseGuard,
} from './types.js';

const getAuthorizationUri =
    (getConfig: GetConnectorConfig): GetAuthorizationUri =>
        async ({state, redirectUri}) => {
            const config = await getConfig(defaultMetadata.id);
            validateConfig<QQConfig>(config, qqConfigGuard);

            const {clientId: client_id, scope} = config;

            const queryParameters = new URLSearchParams({
                client_id: client_id,
                redirect_uri: encodeURI(redirectUri), // The variable `redirectUri` should match {appId, appSecret}
                response_type: 'code',
                scope: scope ?? defaultScope,
                state,
            });

            return `${authorizationEndpoint}?${queryParameters.toString()}`;
        };

export const getOpenId = async (accessToken: string) => {
    const httpResponse = await got.get(openIdEndpoint, {
        searchParams: {
            access_token: accessToken,
            fmt: 'json'
        },
        timeout: {request: defaultTimeout},
        responseType: 'text',
    })
    const result = openIdResponseGuard.safeParse(parseJson(httpResponse.body));
    if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
    }
    const {openid, unionid} = result.data;
    assert(openid, new ConnectorError(ConnectorErrorCodes.InvalidResponse));
    return {openid, unionid};
}

export const getAccessToken = async (
    code: string,
    config: QQConfig,
    redirectUri: string
): Promise<{ accessToken: string; openid: string, unionid?: string }> => {
    const {clientId: client_id, clientSecret: client_secret} = config;

    const httpResponse = await got.get(accessTokenEndpoint, {
        searchParams: {
            client_id,
            client_secret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: encodeURI(redirectUri),
            fmt: 'json'
        },
        timeout: {request: defaultTimeout},
        responseType: 'text',
    });

    const result = accessTokenResponseGuard.safeParse(parseJson(httpResponse.body));

    if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
    }

    const {access_token: accessToken} = result.data;

    getAccessTokenErrorHandler(result.data);

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.InvalidResponse));

    const {openid, unionid} = await getOpenId(accessToken);

    return {accessToken, openid, unionid};
};

const getUserInfo =
    (getConfig: GetConnectorConfig): GetUserInfo =>
        async (data) => {
            const {code, redirectUri} = await authorizationCallbackHandler(data);
            const config = await getConfig(defaultMetadata.id);
            validateConfig<QQConfig>(config, qqConfigGuard);
            const {accessToken, openid, unionid} = await getAccessToken(code, config, redirectUri);

            try {
                const httpResponse = await got.get(userInfoEndpoint, {
                    searchParams: {
                        oauth_consumer_key: config.clientId,
                        access_token: accessToken,
                        openid
                    },
                    timeout: {request: defaultTimeout},
                });

                const result = userInfoResponseGuard.safeParse(parseJson(httpResponse.body));

                if (!result.success) {
                    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
                }

                const {
                    nickname,
                    figureurl,
                    figureurl_1,
                    figureurl_2,
                    figureurl_qq,
                    figureurl_qq_1,
                    figureurl_qq_2,
                    ...data
                } = result.data;

                // Response properties of user info can be separated into two groups: (1) {unionid, headimgurl, nickname}, (2) {errcode, errmsg}.
                // These two groups are mutually exclusive: if group (1) is not empty, group (2) should be empty and vice versa.
                // 'errmsg' and 'errcode' turn to non-empty values or empty values at the same time. Hence, if 'errmsg' is non-empty then 'errcode' should be non-empty.
                userInfoResponseMessageParser(result.data);

                const headimgurl = figureurl_qq_2 ?? figureurl_qq_1 ?? figureurl_qq ?? figureurl_2 ?? figureurl_1 ?? figureurl;

                return {id: unionid ?? openid, avatar: headimgurl, name: nickname, ...data};
            } catch (error: unknown) {
                return getUserInfoErrorHandler(error);
            }
        };

const getAccessTokenErrorHandler: GetAccessTokenErrorHandler = (accessToken) => {
    const {code, msg} = accessToken;

    if (code && code !== 0) {
        throw new ConnectorError(ConnectorErrorCodes.General, {errorDescription: msg, errcode: code});
    }
};

const userInfoResponseMessageParser: UserInfoResponseMessageParser = (userInfo) => {
    const {ret, msg} = userInfo;

    if (ret && ret !== 0) {
        throw new ConnectorError(ConnectorErrorCodes.General, {errorDescription: msg, errcode: ret});
    }
};

const getUserInfoErrorHandler = (error: unknown) => {
    if (error instanceof HTTPError) {
        const {statusCode, body: rawBody} = error.response;

        throw new ConnectorError(ConnectorErrorCodes.General, {
            errorDescription: JSON.stringify(rawBody),
            statusCode,
        });
    }

    throw error;
};

const authorizationCallbackHandler = async (parameterObject: unknown) => {
    const result = authResponseGuard.safeParse(parameterObject);

    if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    return result.data;
};

const createQQConnector: CreateConnector<SocialConnector> = async ({getConfig}) => {
    return {
        metadata: defaultMetadata,
        type: ConnectorType.Social,
        configGuard: qqConfigGuard,
        getAuthorizationUri: getAuthorizationUri(getConfig),
        getUserInfo: getUserInfo(getConfig),
    };
};

export default createQQConnector;
