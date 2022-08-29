import { render, fireEvent } from '@testing-library/react';

import Input from '.';

describe('Input Field UI Component', () => {
  const text = 'foo';
  const onChange = jest.fn();
  const onClear = jest.fn();

  test('render plain text input with value', () => {
    const { container } = render(
      <Input
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
    expect(inputEle).not.toBeNull();
    expect(inputEle?.value).toEqual(text);

    if (inputEle) {
      fireEvent.change(inputEle, { target: { value: 'update' } });
      expect(onChange).toBeCalledWith('update');
    }
  });

  test('render error message', () => {
    const errorCode = 'invalid_email';
    const { queryByText } = render(<Input error={errorCode} />);
    expect(queryByText(errorCode)).not.toBeNull();
  });

  test('click on clear button', () => {
    const { container } = render(
      <Input name="foo" value={text} onChange={onChange} onClear={onClear} />
    );
    const inputField = container.querySelector('input');

    if (inputField) {
      fireEvent.focus(inputField);
    }

    const clearIcon = container.querySelector('svg');
    expect(clearIcon).not.toBeNull();

    if (clearIcon) {
      fireEvent.mouseDown(clearIcon);
      expect(onClear).toBeCalledWith();
    }
  });
});
