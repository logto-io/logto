import { fireEvent, render } from '@testing-library/react';

import SetPassword from '.';

describe('<SetPassword />', () => {
  it('clears each password field from its named clear button', () => {
    const { container, getAllByRole } = render(<SetPassword onSubmit={jest.fn()} />);
    const passwordInput = container.querySelector<HTMLInputElement>('input[name="newPassword"]');
    const confirmPasswordInput = container.querySelector<HTMLInputElement>(
      'input[name="confirmPassword"]'
    );
    const [clearPassword, clearConfirmPassword] = getAllByRole('button', { name: 'action.clear' });

    fireEvent.change(passwordInput!, { target: { value: '1234asdf' } });
    fireEvent.change(confirmPasswordInput!, { target: { value: '1234asdf' } });

    fireEvent.click(clearPassword!);
    expect(passwordInput?.value).toBe('');
    expect(confirmPasswordInput?.value).toBe('1234asdf');

    fireEvent.click(clearConfirmPassword!);
    expect(confirmPasswordInput?.value).toBe('');
  });
});
