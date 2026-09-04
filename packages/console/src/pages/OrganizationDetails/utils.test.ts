import { assembleData } from './utils';

describe('assembleData', () => {
  const formData = {
    customData: '{}',
    isTrustedDeviceAllowed: false,
  };

  it('includes trusted-device policy', () => {
    expect(assembleData(formData)).toMatchObject({ isTrustedDeviceAllowed: false });
  });
});
