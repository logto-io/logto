const request = vi.fn();

vi.mock('./utils.js', () => ({
  request,
}));

const { singleSendMail } = await import('./single-send-mail.js');

describe('singleSendMail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call request with action SingleSendMail', async () => {
    await singleSendMail(
      {
        AccessKeyId: '<access-key-id>',
        AccountName: 'noreply@example.com',
        AddressType: '1',
        FromAlias: 'CompanyName',
        HtmlBody: 'test from logto',
        ReplyToAddress: 'false',
        Subject: 'test',
        ToAddress: 'user@example.com',
      },
      '<access-key-secret>'
    );
    const calledData = request.mock.calls[0];
    expect(calledData).not.toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = calledData?.[1];
    expect(calledData?.[0]).toBe('https://dm.aliyuncs.com/');
    expect(payload).toHaveProperty('Action', 'SingleSendMail');
    expect(payload).toHaveProperty('RegionId', 'cn-hangzhou');
  });

  it('should call request with the endpoint for the specified region', async () => {
    await singleSendMail(
      {
        AccessKeyId: '<access-key-id>',
        AccountName: 'noreply@example.com',
        AddressType: '1',
        FromAlias: 'CompanyName',
        HtmlBody: 'test from logto',
        RegionId: 'ap-southeast-1',
        ReplyToAddress: 'false',
        Subject: 'test',
        ToAddress: 'user@example.com',
      },
      '<access-key-secret>'
    );
    const calledData = request.mock.calls[0];

    expect(calledData?.[0]).toBe('https://dm.ap-southeast-1.aliyuncs.com/');
    expect(calledData?.[1]).toHaveProperty('RegionId', 'ap-southeast-1');
  });
});
