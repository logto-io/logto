import { render, fireEvent } from '@testing-library/react';

import VerificationCode, { defaultLength } from '.';

describe('VerificationCode Component', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('render with value', () => {
    const input = ['1', '2', '3', '4', '5', '6'];

    const { container } = render(
      <VerificationCode name="passcode" value={input} onChange={onChange} />
    );

    const inputElements = container.querySelectorAll('input');
    expect(inputElements).toHaveLength(defaultLength);

    for (const [index, element] of inputElements.entries()) {
      expect(element.value).toEqual(input[index]);
    }
  });

  it('render with short value', () => {
    const input = ['1', '2', '3'];

    const { container } = render(
      <VerificationCode name="passcode" value={input} onChange={onChange} />
    );

    const inputElements = container.querySelectorAll('input');
    expect(inputElements).toHaveLength(defaultLength);

    for (const [index, element] of inputElements.entries()) {
      if (index < 3) {
        expect(element.value).toEqual(input[index]);
      } else {
        expect(element.value).toEqual('');
      }
    }
  });

  it('render with long value', () => {
    const input = ['1', '2', '3', '4', '5', '6', '7'];

    const { container } = render(
      <VerificationCode name="passcode" value={input} onChange={onChange} />
    );

    const inputElements = container.querySelectorAll('input');
    expect(inputElements).toHaveLength(defaultLength);

    for (const [index, element] of inputElements.entries()) {
      expect(element.value).toEqual(input[index]);
    }
  });

  it('on manual input', () => {
    const input = ['1', '2', '3', '4', '5', '6'];
    const { container } = render(
      <VerificationCode name="passcode" value={input} onChange={onChange} />
    );
    const inputElements = container.querySelectorAll('input');

    if (inputElements[2]) {
      fireEvent.input(inputElements[2], { target: { value: '7' } });
      expect(onChange).toBeCalledWith(['1', '2', '7', '4', '5', '6']);
      expect(document.activeElement).toEqual(inputElements[3]);
    }
  });

  it('on manual input with non-numric input', () => {
    const input = ['1', '2', '3', '4', '5', '6'];
    const { container } = render(
      <VerificationCode name="passcode" value={input} onChange={onChange} />
    );
    const inputElements = container.querySelectorAll('input');

    if (inputElements[2]) {
      for (const value of ['a', 'e', '+', '-', '.']) {
        fireEvent.input(inputElements[2], { target: { value } });
        expect(onChange).not.toBeCalled();
      }
    }
  });

  it('replace old value with new input char', () => {
    const input = ['1', '2', '3', '4', '5', '6'];
    const { container } = render(
      <VerificationCode name="passcode" value={input} onChange={onChange} />
    );
    const inputElements = container.querySelectorAll('input');

    if (inputElements[2]) {
      fireEvent.input(inputElements[2], { target: { value: '37' } });
      expect(onChange).toBeCalledWith(['1', '2', '3', '7', '5', '6']);
    }
  });

  it('onKeyDown handler', () => {
    const input = ['1', '2', '3', '4', '5', ''];
    const { container } = render(
      <VerificationCode name="passcode" value={input} onChange={onChange} />
    );
    const inputElements = container.querySelectorAll('input');

    // Backspace on empty input
    if (inputElements[5]) {
      fireEvent.keyDown(inputElements[5], { key: 'Backspace' });
      expect(document.activeElement).toEqual(inputElements[4]);
    }

    // ArrowLeft
    if (inputElements[5]) {
      fireEvent.keyDown(inputElements[5], { key: 'ArrowLeft' });
      expect(document.activeElement).toEqual(inputElements[4]);
    }

    // ArrowRight
    if (inputElements[4]) {
      fireEvent.keyDown(inputElements[4], { key: 'ArrowRight' });
      expect(document.activeElement).toEqual(inputElements[5]);
    }
  });

  describe('onPasteHandler', () => {
    it('full update', () => {
      const input = ['1', '2', '3', '4', '5', '6'];
      const { container } = render(
        <VerificationCode name="passcode" value={input} onChange={onChange} />
      );
      const inputElements = container.querySelectorAll('input');

      if (inputElements[0]) {
        fireEvent.paste(inputElements[0], {
          clipboardData: {
            getData: () => '789012',
          },
        });
        expect(onChange).toBeCalledWith(['7', '8', '9', '0', '1', '2']);
      }
    });

    it('partial update', () => {
      const input = ['1', '2', '3', '4', '5', '6'];
      const { container } = render(
        <VerificationCode name="passcode" value={input} onChange={onChange} />
      );
      const inputElements = container.querySelectorAll('input');

      if (inputElements[2]) {
        fireEvent.paste(inputElements[2], {
          clipboardData: {
            getData: () => '789',
          },
        });
        expect(onChange).toBeCalledWith(['1', '2', '7', '8', '9', '6']);
      }
    });

    it('overLength partial update', () => {
      const input = ['1', '2', '3', '4', '5', '6'];
      const { container } = render(
        <VerificationCode name="passcode" value={input} onChange={onChange} />
      );
      const inputElements = container.querySelectorAll('input');

      if (inputElements[4]) {
        fireEvent.paste(inputElements[4], {
          clipboardData: {
            getData: () => '7890',
          },
        });
        expect(onChange).toBeCalledWith(['1', '2', '3', '4', '7', '8']);
      }
    });

    it('filter numeric past data', () => {
      const input = ['1', '2', '3', '4', '5', '6'];
      const { container } = render(
        <VerificationCode name="passcode" value={input} onChange={onChange} />
      );
      const inputElements = container.querySelectorAll('input');

      if (inputElements[0]) {
        fireEvent.paste(inputElements[0], {
          clipboardData: {
            getData: () => 'test input 124 343',
          },
        });
        expect(onChange).toBeCalledWith(['1', '2', '4', '3', '4', '3']);
      }
    });

    it('Non-numeric past data', () => {
      const input = ['1', '2', '3', '4', '5', '6'];
      const { container } = render(
        <VerificationCode name="passcode" value={input} onChange={onChange} />
      );
      const inputElements = container.querySelectorAll('input');

      if (inputElements[0]) {
        fireEvent.paste(inputElements[0], {
          clipboardData: {
            getData: () => 'test input',
          },
        });
        expect(onChange).not.toBeCalled();
      }
    });
  });
});
