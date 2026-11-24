import { fireEvent, render } from '@testing-library/react';

import CountryCodeSelector from '.';

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

describe('<CountryCodeSelector />', () => {
  it('opens the country code dropdown with Space', () => {
    const { getByRole } = render(<CountryCodeSelector value="1" />);

    fireEvent.keyDown(getByRole('button', { name: '+1' }), { key: ' ' });

    expect(document.querySelector('input[name="country-code-search"]')).not.toBeNull();
  });
});
