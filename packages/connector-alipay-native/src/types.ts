import { z } from 'zod';

import { alipaySigningAlgorithms, pidRegEx } from './constant';

export const alipayNativeConfigGuard = z.object({
  appId: z.string().max(16),
  pid: z.string().regex(pidRegEx),
  privateKey: z.string(),
  signType: z.enum(alipaySigningAlgorithms),
});

export type AlipayNativeConfig = z.infer<typeof alipayNativeConfigGuard>;

// `error_response` and `alipay_system_oauth_token_response` are mutually exclusive.
export type AccessTokenResponse = {
  error_response?: {
    code: string;
    msg: string; // To know `code` and `msg` details, see: https://opendocs.alipay.com/common/02km9f
    sub_code?: string;
    sub_msg?: string;
  };
  sign: string; // To know `sign` details, see: https://opendocs.alipay.com/common/02kf5q
  alipay_system_oauth_token_response?: {
    user_id: string; // Unique Alipay ID, 16 digits starts with '2088'
    access_token: string;
    expires_in: string; // In seconds
    refresh_token: string;
    re_expires_in: string; // Expiring time of refresh token, in seconds
  };
};

export type UserInfoResponse = {
  sign: string; // To know `sign` details, see: https://opendocs.alipay.com/common/02kf5q
  alipay_user_info_share_response: {
    user_id?: string; // String of digits with max length of 16
    avatar?: string; // URL of avatar
    province?: string;
    city?: string;
    nick_name?: string;
    gender?: string; // Enum type: 'F' for female, 'M' for male
    code: string;
    msg: string; // To know `code` and `msg` details, see: https://opendocs.alipay.com/common/02km9f
    sub_code?: string;
    sub_msg?: string;
  };
};
