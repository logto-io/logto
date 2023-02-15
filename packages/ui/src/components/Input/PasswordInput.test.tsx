import { render, fireEvent } from '@testing-library/react';

import PasswordInput from './PasswordInput';

describe('Input Field UI Component', () => {
  const text = 'foo';
  const onChange = jest.fn();

  test('render password input', () => {
    const { container } = render(
      <PasswordInput
        name="foo"
        value={text}
        onChange={({ target }) => {
          if (target instanceof HTMLInputElement) {
            onChange(target.value);
          }
        }}
      />
    );

    const inputEle = container.querySelector('input');
    expect(inputEle?.value).toEqual(text);
    expect(inputEle?.type).toEqual('password');

    if (inputEle) {
      fireEvent.change(inputEle, { target: { value: 'update' } });
      expect(onChange).toBeCalledWith('update');
    }
  });

  test('render error message', () => {
    const errorCode = 'password_required';
    const { queryByText } = render(<PasswordInput error={errorCode} />);
    expect(queryByText(errorCode)).not.toBeNull();
  });

  test('click on toggle visibility button', () => {
    const { container } = render(<PasswordInput name="foo" value={text} onChange={onChange} />);

    const inputEle = container.querySelector('input');

    if (!inputEle) {
      return;
    }

    fireEvent.focus(inputEle);

    const visibilityButton = container.querySelector('svg');
    expect(visibilityButton).not.toBeNull();

    if (visibilityButton) {
      fireEvent.mouseDown(visibilityButton);
      expect(inputEle.type).toEqual('text');
    }
  });
});
