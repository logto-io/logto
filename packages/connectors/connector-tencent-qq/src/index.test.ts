import nock from 'nock';

import {ConnectorError, ConnectorErrorCodes} from '@logto/connector-kit';

import {accessTokenEndpoint, authorizationEndpoint, openIdEndpoint, userInfoEndpoint} from './constant.js';
import createConnector, {getAccessToken} from './index.js';
import {mockedConfig} from './mock.js';

const {jest} = import.meta;

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

const redirectUri = 'http://localhost:3001/callback';
describe('getAuthorizationUri', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get a valid uri by redirectUri and state', async () => {
        const connector = await createConnector({getConfig});
        const authorizationUri = await connector.getAuthorizationUri(
            {
                state: 'some_state',
                redirectUri: redirectUri,
                connectorId: 'some_connector_id',
                connectorFactoryId: 'some_connector_factory_id',
                jti: 'some_jti',
                headers: {},
            },
            jest.fn()
        );

        expect(authorizationUri).toEqual(
            `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&response_type=code&scope=get_user_info&state=some_state`
        );
    });
});

describe('getAccessToken', () => {
    afterEach(() => {
        nock.cleanAll();
        jest.clearAllMocks();
    });

    const accessTokenEndpointUrl = new URL(accessTokenEndpoint);
    const parameters = new URLSearchParams({
        client_id: '<client-id>',
        client_secret: '<client-secret>',
        code: 'code',
        grant_type: 'authorization_code',
        fmt: 'json',
        redirect_uri: encodeURI(redirectUri),
    });

    it('should get an accessToken by exchanging with code', async () => {
        nock(accessTokenEndpointUrl.origin)
            .get(accessTokenEndpointUrl.pathname)
            .query(parameters)
            .reply(200, {
                access_token: 'access_token'
            });
        const {accessToken} = await getAccessToken('code', mockedConfig, redirectUri);
        expect(accessToken).toEqual('access_token');
    });

    it('throws SocialAuthCodeInvalid error if errcode is 100000', async () => {
        nock(accessTokenEndpointUrl.origin)
            .get(accessTokenEndpointUrl.pathname)
            .query(parameters)
            .reply(200, {code: 100000, msg: 'error response'});
        await expect(getAccessToken('code', mockedConfig, redirectUri)).rejects.toMatchError(
            new ConnectorError(ConnectorErrorCodes.General, {
                errorCode: 100000,
                errorDescription: 'error response',
            })
        );
    });

    it('throws SocialAuthCodeInvalid error if errcode is 100005', async () => {
        nock(accessTokenEndpointUrl.origin)
            .get(accessTokenEndpointUrl.pathname)
            .query(true)
            .reply(200, {code: 100005, msg: 'code not exists'});
        await expect(getAccessToken('code', mockedConfig, redirectUri)).rejects.toMatchError(
            new ConnectorError(ConnectorErrorCodes.General, {
                errorCode: 100005,
                errorDescription: 'code not exists',
            })
        );
    });

    it('throws error with message otherwise', async () => {
        nock(accessTokenEndpointUrl.origin)
            .get(accessTokenEndpointUrl.pathname)
            .query(true)
            .reply(200, {code: 100009, msg: 'system error'});
        await expect(getAccessToken('wrong_code', mockedConfig, redirectUri)).rejects.toMatchError(
            new ConnectorError(ConnectorErrorCodes.General, {
                errorDescription: 'system error',
                errorCode: 100009,
            })
        );
    });
});

describe('getUserInfo', () => {
    beforeEach(() => {


        const openIdEndpointUrl = new URL(openIdEndpoint);
        const parameters = new URLSearchParams({
            access_token: 'access_token',
            fmt: 'json',
        });

        nock(openIdEndpointUrl.origin)
            .get(openIdEndpointUrl.pathname)
            .query(parameters)
            .reply(200, {
                openid: 'openid',
                unionid: 'unionid',
                client_id: '<client-id>',
            });


        const accessTokenEndpointUrl = new URL(accessTokenEndpoint);
        const accessTokenParameters = new URLSearchParams({
            client_id: '<client-id>',
            client_secret: '<client-secret>',
            code: 'code',
            grant_type: 'authorization_code',
            fmt: 'json',
            redirect_uri: encodeURI(redirectUri),
        });

        nock(accessTokenEndpointUrl.origin)
            .get(accessTokenEndpointUrl.pathname)
            .query(accessTokenParameters)
            .reply(200, {
                access_token: 'access_token',
            });
    });

    afterEach(() => {
        nock.cleanAll();
        jest.clearAllMocks();
    });

    const userInfoEndpointUrl = new URL(userInfoEndpoint);
    const parameters = new URLSearchParams({
        oauth_consumer_key: '<client-id>',
        access_token: "access_token",
        openid: "openid",
    });

    it('should get valid SocialUserInfo', async () => {
        nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(200, {
            openid: 'this_is_an_arbitrary_wechat_union_id',
            figureurl_2: 'https://github.com/images/error/octocat_happy.gif',
            nickname: 'wechat bot',
        });
        const connector = await createConnector({getConfig});
        const socialUserInfo = await connector.getUserInfo(
            {
                code: 'code',
                redirectUri: redirectUri,
            },
            jest.fn()
        );
        expect(socialUserInfo).toMatchObject({
            id: 'unionid',
            avatar: 'https://github.com/images/error/octocat_happy.gif',
            name: 'wechat bot',
        });
    });
});
