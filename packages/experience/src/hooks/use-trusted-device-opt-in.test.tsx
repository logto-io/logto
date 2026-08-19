import { render } from '@testing-library/react';

import { getInteraction } from '@/apis/experience';

import useTrustedDeviceOptIn from './use-trusted-device-opt-in';

jest.mock('@/apis/experience', () => ({
  getInteraction: jest.fn(),
}));

jest.mock('@/constants/env', () => ({
  isDevFeaturesEnabled: false,
}));

const TestHook = () => {
  useTrustedDeviceOptIn();
  return null;
};

it('does not query trusted-device availability when dev features are disabled', () => {
  render(<TestHook />);

  expect(getInteraction).not.toBeCalled();
});
