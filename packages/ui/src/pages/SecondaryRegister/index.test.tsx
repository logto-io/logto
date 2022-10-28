import { render } from '@testing-library/react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';

import SecondaryRegister from '@/pages/SecondaryRegister';

jest.mock('@/apis/register', () => ({ register: jest.fn(async () => 0) }));
jest.mock('i18next', () => ({
  language: 'en',
}));

describe('<SecondaryRegister />', () => {
  test('renders without exploding', async () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <SecondaryRegister />
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).not.toBeNull();
    expect(queryByText('action.create')).not.toBeNull();
  });

  test('renders phone', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/register/sms']}>
        <Routes>
          <Route path="/register/:method" element={<SecondaryRegister />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).not.toBeNull();
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
  });

  test('renders email', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/register/email']}>
        <Routes>
          <Route path="/register/:method" element={<SecondaryRegister />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).not.toBeNull();
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
  });

  test('renders non-recognized method', async () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/register/test']}>
        <Routes>
          <Route path="/register/:method" element={<SecondaryRegister />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
