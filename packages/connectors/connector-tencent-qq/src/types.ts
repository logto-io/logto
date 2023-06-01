import {z} from 'zod';

export const qqConfigGuard = z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    scope: z.string().optional(),
});

export type QQConfig = z.infer<typeof qqConfigGuard>;

export const accessTokenResponseGuard = z.object({
    access_token: z.string().optional(),
    expires_in: z.number().optional(), // In seconds
    refresh_token: z.string().optional(),
    code: z.number().optional(),
    msg: z.string().optional(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const openIdResponseGuard = z.object({
    client_id: z.string().optional(),
    openid: z.string().optional(),
    unionid: z.string().optional(),
});

export type OpenIdResponse = z.infer<typeof openIdResponseGuard>;

export type GetAccessTokenErrorHandler = (accessToken: Partial<AccessTokenResponse>) => void;

export const userInfoResponseGuard = z.object({
    ret: z.number().optional(),
    msg: z.string().optional(),
    is_lost: z.number().optional(),
    nickname: z.string().optional(),
    gender: z.string().optional(),
    gender_type: z.number().optional(),
    province: z.string().optional(),
    city: z.string().optional(),
    year: z.string().optional(),
    constellation: z.string().optional(),
    figureurl: z.string().optional(),
    figureurl_1: z.string().optional(),
    figureurl_2: z.string().optional(),
    figureurl_qq_1: z.string().optional(),
    figureurl_qq_2: z.string().optional(),
    figureurl_qq: z.string().optional(),
    figureurl_type: z.string().optional(),
    is_yellow_vip: z.string().optional(),
    vip: z.string().optional(),
    yellow_vip_level: z.string().optional(),
    level: z.string().optional(),
    is_yellow_year_vip: z.string().optional(),
})

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export type UserInfoResponseMessageParser = (userInfo: Partial<UserInfoResponse>) => void;

export const authResponseGuard = z.object({code: z.string(), redirectUri: z.string()});
