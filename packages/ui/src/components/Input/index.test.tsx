import { render, fireEvent } from '@testing-library/react';
import React from 'react';

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
    const errorCode = 'user.email_not_exists';
    const { queryByText } = render(<Input error={errorCode} />);
    expect(queryByText(`errors:${errorCode}`)).not.toBeNull();
  });

  test('click on clear button', () => {
    const { container } = render(
      <Input name="foo" value={text} onChange={onChange} onClear={onClear} />
    );
    const inputField = container.querySelector('input');

    expect(container.querySelector('svg')).toBeNull();

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
