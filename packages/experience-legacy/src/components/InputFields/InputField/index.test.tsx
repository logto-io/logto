import { render, fireEvent } from '@testing-library/react';

import InputField from '.';

describe('InputField Component', () => {
  const text = 'foo';
  const onChange = jest.fn();

  test('render plain text input with value', () => {
    const { container } = render(
      <InputField
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
    expect(inputElement).not.toBeNull();
    expect(inputElement?.value).toEqual(text);

    if (inputElement) {
      fireEvent.change(inputElement, { target: { value: 'update' } });
      expect(onChange).toBeCalledWith('update');
    }
  });

  test('render error message', () => {
    const errorCode = 'invalid_email';
    const { queryByText } = render(<InputField errorMessage={errorCode} />);
    expect(queryByText(errorCode)).not.toBeNull();
  });

  test('render suffix', () => {
    const text = 'clearBtn';
    const { queryByText } = render(<InputField suffix={<button>{text}</button>} />);
    expect(queryByText(text)).not.toBeNull();
  });
});
