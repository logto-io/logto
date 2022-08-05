// FIXME: @Darcy
/* eslint-disable unicorn/text-encoding-identifier-case */
import { AlipayConfig } from './types';

export const mockedTimestamp = '2022-02-22 22:22:22';

export const mockedAlipayConfig: AlipayConfig = {
  appId: '2021000000000000',
  signType: 'RSA2',
  privateKey: '<private-key>',
  charset: 'UTF8',
};

export const mockedAlipayConfigWithValidPrivateKey: AlipayConfig = {
  appId: '2021000000000000',
  signType: 'RSA2',
  privateKey:
    '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC52SvnlRfzJJDR\nA1h4MX2JWV7Yt1j+1gvtQuLh0RYbE0AgRyz8CXFcJegO8gNyUQ05vrc1RMVzvNh8\njfjLpIX8an88KE4FyoG5P8NWrwPw5ZXOnzdvNxAV8QWOU+rT4WAdCsx4++mLlb5v\nGL18R77f3WLgY23bFtcGr9q7/qOaLzNxEe4idX1eLf7Ba/gQRY0awA55/Epd1Mi7\nLqTfxTd11PoBZQPe0vnuChp3P2l1MNpIJ5G1eQ4RXgI4UMClEbGRlBN7GUlXy5p7\ng6RtvOcwmBNoE4i0/HbvaanY3u7oenST3iSzEXa2hXMjnZPvg0G4Y5mq/V6XJPTh\nJrFc9XzFAgMBAAECggEAXfmNtN10LdN4kugBLU3BL9mMF0Om8b1kbIXc2djzN5+l\nVm0HNy7DLphQXnZL/ds0N9XTKFFtEpgUU+8qNjcsNTXYvp+WzGDY9cZjTQrUkFRX\nSxLBYjBSpvWoHI8ceCVHh4f1Wtvu/VEr6Vt2PUi+IM7+d35vh1BmTJBRp6wcKBMH\nXdfjWIi5z37pTXD3OTfUjBCtzA2DX0vY6UTsmD9UI0Mb6IJdT6qugiGODFdlsduA\nWJoZlXV1VbHcvGt7DoeQgzA45sr5siUnm+ntTVBHOR/hoZQrr0DY/O/MLKYUj/+r\nZMKKpx/7VHnWfMia2EOHfjW8vUlnraUzI+5E2/FzIQKBgQDgi7S7pfRux8YONGP2\nRtHPkF8d0YllsfKedhqF3cQlJ1dhxzVqHOi1IFn6ttuuYy5UsP5apYa2kj2UUPCa\nZGGi19Vnc+RHThpR4K6/OGFrpbINAgiVJLj7F8GXzqeA7W2ZHMp1R+oB+oTxih6t\nU0dbeTP01kbBV1/7+ZUKPhLE6QKBgQDT4cMgq01F/WIGGd1GUHZQjH5bqtNiJpIf\n2Q2OTw/gn1DVnwDXpHuXPxtC3NRoaRW/dTqsF6AAkMja3voPM3sYJurGBdU8pZPC\nquc9mqqu6TR5gX3KL1lSESvMBEgfLUy/f0gI3JNw1mG17pIhnXmOB2be3HfZPcj3\nwKWlluY/fQKBgDLll97c3A3sPGll2K6vGMmqmNTCdRlW/36JmLN1NAuT4kuoguP9\nj4XWwm6A2kSp+It73vue/20MsuaWfiMQ08y8jYO4kirTekXK3vE7D2H+GeC28EkW\nHNPVa61ES1V++9Oz4fQ5i8JNDatOOmvhL5B9ZZh+pWUXsAsGZJEAxvJZAoGAMPHO\n5GYN1KQil6wz3EFMA3Fg4wYEDIFCcg7uvbfvwACtaJtxU18QmbCfOIPQoUndFzwa\nUJSohljrvPuTIh3PSpX618GTL45EIszd2/I1iXAfig3qo+DqLjX/OwKmMmWBfB8H\n4dwqRv+O1LsGkLNS2AdHsSWWnd1S5kBfQ3AnQfUCgYACM8ldXZv7uGt9uZBmxile\nB0Hg5w7F1v9VD/m9ko+INAISz8OVkD83pCEoyHwlr20JjiF+yzAakOuq6rBi+l/V\n1veSiTDUcZhciuq1G178dFYepJqisFBu7bAM+WBS4agTTtxdSLZkHeS4VX+H3DOc\ntri43NXw6QS7uQ5/+2TsEw==\n-----END PRIVATE KEY-----',
  charset: 'UTF8',
};

export const mockedAlipayPublicParameters = {
  format: 'JSON',
  grantType: 'authorization_code',
  timestamp: mockedTimestamp,
  version: '1.0',
  method: '<method-placeholder>',
};
/* eslint-enable unicorn/text-encoding-identifier-case */
