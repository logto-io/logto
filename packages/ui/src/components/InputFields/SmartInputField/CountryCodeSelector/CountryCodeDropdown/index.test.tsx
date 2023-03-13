import { assert } from '@silverhand/essentials';
import { render, fireEvent, waitFor, act } from '@testing-library/react';

import { getCountryList } from '@/utils/country-code';

import CountryCodeDropdown from '.';

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

describe('CountryCodeDropdown', () => {
  const onChange = jest.fn();
  const onClose = jest.fn();
  const countryList = getCountryList();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render properly', async () => {
    const countryCode = '1';
    const alterCountryCode = '86';

    const { queryByText, container, getByText } = render(
      <CountryCodeDropdown
        isOpen
        countryCode={countryCode}
        countryList={countryList}
        onClose={onClose}
        onChange={onChange}
      />
    );

    await waitFor(() => {
      expect(
        container.parentElement?.querySelector('input[name="country-code-search"]')
      ).not.toBeNull();
    });

    expect(queryByText(`+${countryCode}`)).not.toBeNull();
    expect(queryByText(`+${alterCountryCode}`)).not.toBeNull();

    fireEvent.click(getByText(`+${alterCountryCode}`));
    expect(onChange).toBeCalledWith(alterCountryCode);
    expect(onClose).toBeCalled();
  });

  it('should render properly with search', async () => {
    const countryCode = '1';
    const alterCountryCode = '86';

    const { queryByText, container } = render(
      <CountryCodeDropdown
        isOpen
        countryCode={countryCode}
        countryList={countryList}
        onClose={onClose}
        onChange={onChange}
      />
    );

    expect(queryByText(`+${countryCode}`)).not.toBeNull();
    expect(queryByText(`+${alterCountryCode}`)).not.toBeNull();

    const searchInput = container.parentElement?.querySelector('input[name="country-code-search"]');
    assert(searchInput, new Error('Search input not found'));

    act(() => {
      fireEvent.change(searchInput, { target: { value: alterCountryCode } });
    });

    await waitFor(() => {
      expect(queryByText(`+${countryCode}`)).toBeNull();
      expect(queryByText(`+${alterCountryCode}`)).not.toBeNull();
    });
  });
});
