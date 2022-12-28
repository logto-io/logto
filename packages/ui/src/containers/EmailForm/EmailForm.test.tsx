import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import EmailForm from './EmailForm';

const onSubmit = jest.fn();
const clearErrorMessage = jest.fn();

describe('<EmailForm/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('render', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter>
        <EmailForm onSubmit={onSubmit} />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('render with terms settings', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailForm onSubmit={onSubmit} />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('render with terms settings but hasTerms param set to false', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailForm hasTerms={false} onSubmit={onSubmit} />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).toBeNull();
  });

  test('required email with error message', () => {
    const { queryByText, container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <EmailForm onSubmit={onSubmit} />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');

    fireEvent.click(submitButton);
    expect(queryByText('invalid_email')).not.toBeNull();
    expect(onSubmit).not.toBeCalled();

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo' } });
      expect(queryByText('invalid_email')).not.toBeNull();

      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
      expect(queryByText('invalid_email')).toBeNull();
    }
  });

  test('should display and clear the form error message as expected', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter>
        <EmailForm
          errorMessage="form error"
          clearErrorMessage={clearErrorMessage}
          onSubmit={onSubmit}
        />
      </MemoryRouter>
    );

    expect(queryByText('form error')).not.toBeNull();

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo' } });
      expect(clearErrorMessage).toBeCalled();
    }
  });

  test('should blocked by terms validation with terms settings enabled', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailForm onSubmit={onSubmit} />
        </SettingsProvider>
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(onSubmit).not.toBeCalled();
    });
  });

  test('should call onSubmit properly with terms settings enabled but hasTerms param set to false', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailForm hasTerms={false} onSubmit={onSubmit} />
        </SettingsProvider>
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({ email: 'foo@logto.io' });
    });
  });

  test('should call onSubmit method properly with terms settings enabled and checked', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailForm onSubmit={onSubmit} />
        </SettingsProvider>
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }

    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({ email: 'foo@logto.io' });
    });
  });
});
