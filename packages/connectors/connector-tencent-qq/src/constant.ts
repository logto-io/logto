import type {ConnectorMetadata} from '@logto/connector-kit';
import {ConnectorConfigFormItemType, ConnectorPlatform} from '@logto/connector-kit';

export const authorizationEndpoint = 'https://graph.qq.com/oauth2.0/authorize';
export const accessTokenEndpoint = 'https://graph.qq.com/oauth2.0/token';

export const openIdEndpoint = 'https://graph.qq.com/oauth2.0/me';
export const userInfoEndpoint = 'https://graph.qq.com/user/get_user_info';
export const scope = 'get_user_info';

export const defaultMetadata: ConnectorMetadata = {
    id: 'qq-web',
    target: 'qq',
    platform: ConnectorPlatform.Web,
    name: {
        en: 'QQ',
        'zh-CN': 'QQ',
        'tr-TR': 'QQ',
        ko: 'QQ',
    },
    logo: './logo.svg',
    logoDark: null,
    description: {
        en: 'QQ is a cross-platform instant messaging software.',
        'zh-CN': 'QQ 是一款跨平台的即时通讯软件。',
    },
    readme: './README.md',
    formItems: [
        {
            key: 'clientId',
            label: 'Client ID',
            required: true,
            type: ConnectorConfigFormItemType.Text,
            placeholder: '<client-id>',
        },
        {
            key: 'clientSecret',
            label: 'Client Secret',
            required: true,
            type: ConnectorConfigFormItemType.Text,
            placeholder: '<client-secret>',
        },
        {
            key: 'scope',
            type: ConnectorConfigFormItemType.Text,
            label: 'Scope',
            required: false,
            placeholder: '<scope>',
            description:
                "The `scope` determines permissions granted by the user's authorization. If you are not sure what to enter, do not worry, just leave it blank.",
        },
    ],
};

export const defaultTimeout = 5000;
