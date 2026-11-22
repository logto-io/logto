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

  test('click on toggle visibility button', () => {
    const { container, getByRole } = render(
      <PasswordInputField name="foo" value={text} onChange={onChange} />
    );

    const inputElement = container.querySelector('input');
    const toggle = getByRole('button', { name: 'action.show_password' });

    expect(inputElement?.type).toEqual('password');
    expect(toggle.getAttribute('aria-pressed')).toEqual('false');

    fireEvent.click(toggle);
    expect(inputElement?.type).toEqual('text');
    expect(toggle.getAttribute('aria-pressed')).toEqual('true');

    fireEvent.click(toggle);
    expect(inputElement?.type).toEqual('password');
    expect(toggle.getAttribute('aria-pressed')).toEqual('false');
  });

  test('pressing the toggle keeps focus in the input', () => {
    const { container, getByRole } = render(
      <PasswordInputField name="foo" value={text} onChange={onChange} />
    );

    const inputElement = container.querySelector('input');
    const toggle = getByRole('button', { name: 'action.show_password' });

    // `fireEvent` returns false when the default action was prevented
    expect(fireEvent.mouseDown(toggle)).toBe(false);
    // The mouse down alone does not toggle; the following click does
    expect(inputElement?.type).toEqual('password');
  });
});
