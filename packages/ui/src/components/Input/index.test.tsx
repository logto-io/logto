import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import Input from '.';

describe('Input Field UI Component', () => {
  const text = 'foo';
  const onChange = jest.fn();

  test('render plain text input with value', () => {
    const { container } = render(<Input name="foo" value={text} onChange={onChange} />);
    const inputEle = container.querySelector('input');
    expect(inputEle).not.toBeNull();
    expect(inputEle?.value).toEqual(text);

    if (inputEle) {
      fireEvent.change(inputEle, { target: { value: 'update' } });
      expect(onChange).toBeCalledWith('update');
    }
  });

  test('click on clear button', () => {
    const { container } = render(<Input name="foo" value={text} onChange={onChange} />);
    const inputField = container.querySelector('input');

    expect(container.querySelector('svg')).toBeNull();

    if (inputField) {
      fireEvent.focus(inputField);
    }

    const clearIcon = container.querySelector('svg');
    expect(clearIcon).not.toBeNull();

    if (clearIcon) {
      fireEvent.mouseDown(clearIcon);
      expect(onChange).toBeCalledWith('');
    }
  });
});
