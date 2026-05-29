import { mockedConfig, mockedConfigWithAllRequiredTemplates } from './mock.js';
import { aliyunDmConfigGuard } from './types.js';

describe('aliyunDmConfigGuard', () => {
  it('throws when required templates not provided', () => {
    const result = aliyunDmConfigGuard.safeParse(mockedConfig);
    expect(result.success).toEqual(false);
  });

  it('passes when all required templated are presented', () => {
    const result = aliyunDmConfigGuard.safeParse(mockedConfigWithAllRequiredTemplates);
    expect(result.success).toEqual(true);
  });

  it('passes with supported region', () => {
    const result = aliyunDmConfigGuard.safeParse({
      ...mockedConfigWithAllRequiredTemplates,
      regionId: 'ap-southeast-1',
    });
    expect(result.success).toEqual(true);
  });

  it('throws with unsupported region', () => {
    const result = aliyunDmConfigGuard.safeParse({
      ...mockedConfigWithAllRequiredTemplates,
      regionId: 'cn-shanghai',
    });
    expect(result.success).toEqual(false);
  });
});
