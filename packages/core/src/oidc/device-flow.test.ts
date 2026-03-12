import {
  buildDeviceFlowPageUrl,
  buildDeviceFlowSuccessPageUrl,
  defaultDeviceCodeTtl,
} from './device-flow.js';

describe('buildDeviceFlowPageUrl', () => {
  it('should build a structured device-flow query from the callback state', () => {
    expect(buildDeviceFlowPageUrl({ xsrf: 'foo' })).toBe('/device?xsrf=foo');
  });

  it('should append confirm-mode user_code and input-mode error redisplay separately', () => {
    expect(
      buildDeviceFlowPageUrl({
        error: 'NoCodeError',
        inputCode: 'raw-code',
        xsrf: 'foo',
      })
    ).toBe('/device?xsrf=foo&input_code=raw-code&error=NoCodeError');
    expect(
      buildDeviceFlowPageUrl({
        error: 'NoCodeError',
        userCode: 'ABCD-EFGH',
        xsrf: 'foo',
      })
    ).toBe('/device?xsrf=foo&user_code=ABCD-EFGH&error=NoCodeError');
  });
});

describe('buildDeviceFlowSuccessPageUrl', () => {
  it('should return the success route for the device flow experience page', () => {
    expect(buildDeviceFlowSuccessPageUrl()).toBe('/device/success');
  });
});

describe('defaultDeviceCodeTtl', () => {
  it('should keep the oidc-provider default device-code lifetime', () => {
    expect(defaultDeviceCodeTtl).toBe(600);
  });
});
