import { assembleData } from './utils';

describe('assembleData', () => {
  const formData = {
    customData: '{}',
    isTrustedDeviceAllowed: false,
  };

  it('includes trusted-device policy when the dev feature is enabled', () => {
    expect(assembleData(formData, true)).toMatchObject({ isTrustedDeviceAllowed: false });
  });

  it('omits trusted-device policy when the dev feature is disabled', () => {
    expect(assembleData(formData)).not.toHaveProperty('isTrustedDeviceAllowed');
  });
});
