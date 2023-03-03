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
    const { container } = render(
      <PasswordInputField name="foo" value={text} onChange={onChange} />
    );

    const inputElement = container.querySelector('input');

    if (!inputElement) {
      return;
    }

    expect(inputElement.type).toEqual('password');

    const visibilityButton = container.querySelector('svg');
    expect(visibilityButton).not.toBeNull();

    if (visibilityButton) {
      fireEvent.mouseDown(visibilityButton);
      expect(inputElement.type).toEqual('text');
    }
  });
});
