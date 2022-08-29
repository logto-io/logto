export const mockedParameters = {
  AccessKeyId: 'testid',
  AccountName: "<a%b'>",
  Action: 'SingleSendMail',
  AddressType: '1',
  Format: 'XML',
  HtmlBody: '4',
  RegionId: 'cn-hangzhou',
  ReplyToAddress: 'true',
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  Subject: '3',
  TagName: '2',
  ToAddress: '1@test.com',
  Version: '2015-11-23',
};

export const mockedConfig = {
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret',
  accountName: 'accountName',
  templates: [
    {
      usageType: 'SignIn',
      content: 'Your code is {{code}}, {{code}} is your code',
      subject: 'subject',
    },
  ],
};
