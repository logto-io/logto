import { assert } from '@silverhand/essentials';
import { render, fireEvent, waitFor, act } from '@testing-library/react';

import { getCountryList } from '@/utils/country-code';

import CountryCodeDropdown from '.';

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

// Need to mock the scrollIntoView method because jsdom doesn't support it
// eslint-disable-next-line @silverhand/fp/no-mutation
Element.prototype.scrollIntoView = jest.fn();

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

  it('should render search results properly and auto focus ', async () => {
    const initialCountryCode = '1';
    const search = '8';
    const firstSearchResult = countryList
      .map(({ countryCallingCode }) => countryCallingCode)
      .find((countryCode) => countryCode.startsWith(search));

    const { queryByText, container } = render(
      <CountryCodeDropdown
        isOpen
        countryCode={initialCountryCode}
        countryList={countryList}
        onClose={onClose}
        onChange={onChange}
      />
    );

    assert(firstSearchResult, new Error('First search result not found'));

    expect(queryByText(`+${initialCountryCode}`)).not.toBeNull();
    expect(queryByText(`+${firstSearchResult}`)).not.toBeNull();

    const searchInput = container.parentElement?.querySelector('input[name="country-code-search"]');
    assert(searchInput, new Error('Search input not found'));

    act(() => {
      fireEvent.change(searchInput, { target: { value: search } });
    });

    await waitFor(() => {
      expect(queryByText(`+${initialCountryCode}`)).toBeNull();
      expect(queryByText(`+${firstSearchResult}`)).not.toBeNull();
    });

    act(() => {
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });

    expect(onChange).toBeCalledWith(firstSearchResult);
  });

  it('should navigate through search results properly on KeyUp and KeyDown press', async () => {
    const initialCountryCode = '1';
    const search = '8';

    const searchResults = countryList
      .map(({ countryCallingCode }) => countryCallingCode)
      .filter((countryCode) => countryCode.startsWith(search));

    const { queryByText, container } = render(
      <CountryCodeDropdown
        isOpen
        countryCode={initialCountryCode}
        countryList={countryList}
        onClose={onClose}
        onChange={onChange}
      />
    );

    expect(queryByText(`+${initialCountryCode}`)).not.toBeNull();

    for (const element of searchResults) {
      expect(queryByText(`+${element}`)).not.toBeNull();
    }

    const searchInput = container.parentElement?.querySelector('input[name="country-code-search"]');
    assert(searchInput, new Error('Search input not found'));

    act(() => {
      fireEvent.change(searchInput, { target: { value: search } });
    });

    await waitFor(() => {
      expect(queryByText(`+${initialCountryCode}`)).toBeNull();

      for (const element of searchResults) {
        expect(queryByText(`+${element}`)).not.toBeNull();
      }
    });

    if (searchResults.length <= 1) {
      return;
    }

    act(() => {
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    });

    act(() => {
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });

    expect(onChange).toBeCalledWith(searchResults[1]);
  });
});
