import { render, fireEvent } from '@testing-library/react';

import PasswordInputField from '.';

describe('Input Field UI Component', () => {
  const text = 'foo';
  const onChange = jest.fn();

  test('render password input', () => {
    const { container } = render(
      <PasswordInputField
        name="foo"
        value={text}
        onChange={({ target }) => {
          if (target instanceof HTMLInputElement) {
            onChange(target.value);
          }
        }}
      />
    );

    const inputElement = container.querySelector('input');
    expect(inputElement?.value).toEqual(text);
    expect(inputElement?.type).toEqual('password');

    if (inputElement) {
      fireEvent.change(inputElement, { target: { value: 'update' } });
      expect(onChange).toBeCalledWith('update');
    }
  });

  test('render error message', () => {
    const errorCode = 'password_required';
    const { queryByText } = render(<PasswordInputField errorMessage={errorCode} />);
    expect(queryByText(errorCode)).not.toBeNull();
  });

  test('toggle visibility on click', () => {
    const { container, getByRole } = render(
      <PasswordInputField name="foo" value={text} onChange={onChange} />
    );

    const inputElement = container.querySelector('input');
    const toggleButton = getByRole('button', { name: 'action.show_password' });

    expect(inputElement?.type).toEqual('password');
    expect(toggleButton.getAttribute('aria-pressed')).toEqual('false');

    // Enter and Space on a focused button dispatch `click`
    fireEvent.click(toggleButton);
    expect(inputElement?.type).toEqual('text');
    expect(toggleButton.getAttribute('aria-pressed')).toEqual('true');

    fireEvent.click(toggleButton);
    expect(inputElement?.type).toEqual('password');
    expect(toggleButton.getAttribute('aria-pressed')).toEqual('false');
  });

  test('keep input focus and toggle once on pointer press', () => {
    const { container, getByRole } = render(
      <PasswordInputField name="foo" value={text} onChange={onChange} />
    );

    const inputElement = container.querySelector('input');
    const toggleButton = getByRole('button', { name: 'action.show_password' });

    // `fireEvent` returns `false` when the default action is prevented
    expect(fireEvent.mouseDown(toggleButton)).toBe(false);
    fireEvent.click(toggleButton);
    expect(inputElement?.type).toEqual('text');
  });
});
