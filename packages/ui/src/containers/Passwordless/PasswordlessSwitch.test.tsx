import { fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';

import PasswordlessSwitch from './PasswordlessSwitch';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('<PasswordlessSwitch />', () => {
  afterEach(() => {
    mockedNavigate.mockClear();
  });

  test('render sms passwordless switch', () => {
    const { queryByText, getByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/sms']}>
        <PasswordlessSwitch target="email" />
      </MemoryRouter>
    );

    expect(queryByText('action.switch_to')).not.toBeNull();

    const link = getByText('action.switch_to');
    fireEvent.click(link);

    expect(mockedNavigate).toBeCalledWith(
      { pathname: '/forgot-password/email' },
      { replace: true }
    );
  });

  test('render email passwordless switch', () => {
    const { queryByText, getByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/email']}>
        <PasswordlessSwitch target="sms" />
      </MemoryRouter>
    );

    expect(queryByText('action.switch_to')).not.toBeNull();

    const link = getByText('action.switch_to');
    fireEvent.click(link);

    expect(mockedNavigate).toBeCalledWith({ pathname: '/forgot-password/sms' }, { replace: true });
  });
});
