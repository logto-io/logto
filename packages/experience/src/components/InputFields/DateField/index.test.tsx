import { SupportedDateFormat } from '@logto/schemas';
import { render, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';

import DateField from '.';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => options?.label ?? key,
    i18n: { dir: () => 'ltr' },
  }),
}));

// Helper controlled wrapper so DateField reflects user input value updates
const Controlled = (props: React.ComponentProps<typeof DateField>) => {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <DateField
      {...props}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        props.onChange?.(newValue);
      }}
    />
  );
};

describe('DateField Component', () => {
  test('render US format placeholders and separator', () => {
    const { container } = render(
      <DateField dateFormat={SupportedDateFormat.US} label="Date of birth" />
    );

    const labelNode = Array.from(container.querySelectorAll('*')).find(
      (element) => element.textContent === 'Date of birth'
    );
    expect(labelNode).toBeTruthy();
    act(() => {
      fireEvent.click(labelNode!);
    });

    const inputs = Array.from(container.querySelectorAll('input'));
    expect(inputs).toHaveLength(3);
    expect(inputs[0]?.getAttribute('placeholder')).toBe('MM');
    expect(inputs[1]?.getAttribute('placeholder')).toBe('DD');
    expect(inputs[2]?.getAttribute('placeholder')).toBe('YYYY');

    const separators = container.querySelectorAll('span');

    expect(
      Array.from(separators).filter((spanElement) => spanElement.textContent === '/')
    ).toHaveLength(2);
  });

  test('typing fills each part and produces final date (controlled, 2023-08-20)', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled
        dateFormat={SupportedDateFormat.US}
        label="Date of birth"
        onChange={handleChange}
      />
    );
    const labelNode = Array.from(container.querySelectorAll('*')).find(
      (element) => element.textContent === 'Date of birth'
    );
    act(() => {
      fireEvent.click(labelNode!);
    });
    const inputs = Array.from(container.querySelectorAll('input'));

    act(() => {
      fireEvent.input(inputs[0]!, { target: { value: '08' } });
      fireEvent.input(inputs[1]!, { target: { value: '20' } });
      fireEvent.input(inputs[2]!, { target: { value: '2023' } });
    });

    expect(handleChange).toHaveBeenLastCalledWith('08/20/2023');
    // Also ensure DOM reflects the value
    expect(inputs[2]!.value).toBe('2023');
  });

  test('backspace deletes one character; moves to previous field when caret at start', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled
        dateFormat={SupportedDateFormat.US}
        value="08/20/2023"
        label="Date of birth"
        onChange={handleChange}
      />
    );
    const labelNode = Array.from(container.querySelectorAll('*')).find(
      (element) => element.textContent === 'Date of birth'
    );
    act(() => {
      fireEvent.click(labelNode!);
    });
    const inputs = Array.from(container.querySelectorAll('input'));
    const month = inputs[0]!;
    const day = inputs[1]!;
    const year = inputs[2]!;

    // Initial assertions
    expect(month.value).toBe('08');
    expect(day.value).toBe('20');
    expect(year.value).toBe('2023');

    const deleteLastChar = (input: HTMLInputElement) => {
      const current = input.value;
      const next = current.slice(0, -1);
      act(() => {
        fireEvent.keyDown(input, { key: 'Backspace' });
        // Simulate browser applying new value (Backspace default behavior)
        fireEvent.input(input, { target: { value: next } });
      });
    };

    // Delete year digits one by one
    year.focus();
    deleteLastChar(year); // 2023 -> 202
    expect(handleChange).toHaveBeenLastCalledWith('08/20/202');
    deleteLastChar(year); // 202 -> 20
    expect(handleChange).toHaveBeenLastCalledWith('08/20/20');
    deleteLastChar(year); // 20 -> 2
    expect(handleChange).toHaveBeenLastCalledWith('08/20/2');
    deleteLastChar(year); // 2 -> '' (becomes 08/20/)
    expect(handleChange).toHaveBeenLastCalledWith('08/20/');

    // Current (year) empty; Backspace now should move to previous (day) and delete its last char
    act(() => {
      fireEvent.keyDown(year, { key: 'Backspace' });
    });
    expect(handleChange).toHaveBeenLastCalledWith('08/2/');
    expect(document.activeElement).toBe(day);

    // Delete remaining day digit via single-char deletion
    deleteLastChar(day); // 2 -> '' => 08//
    expect(handleChange).toHaveBeenLastCalledWith('08//');

    // Backspace on empty day moves to month and deletes one char (08 -> 0)
    act(() => {
      fireEvent.keyDown(day, { key: 'Backspace' });
    });
    expect(handleChange).toHaveBeenLastCalledWith('0//');
    expect(document.activeElement).toBe(month);

    // Delete last month digit
    deleteLastChar(month); // 0 -> '' => all empty -> '' (not '//')
    expect(handleChange).toHaveBeenLastCalledWith('');

    const emittedValues = handleChange.mock.calls.map((call) => call[0]);
    // Ensure no final dangling '//' value
    expect(emittedValues.filter((value) => value === '//')).toHaveLength(0);
  });

  test('backspace at start of non-empty field moves to previous and deletes last char there', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled
        dateFormat={SupportedDateFormat.US}
        value="08/20/2023"
        label="Date of birth"
        onChange={handleChange}
      />
    );
    const labelNode = Array.from(container.querySelectorAll('*')).find(
      (element) => element.textContent === 'Date of birth'
    );
    act(() => {
      fireEvent.click(labelNode!);
    });
    const inputs = Array.from(container.querySelectorAll('input'));
    const day = inputs[1]!; // Value '20'
    const month = inputs[0]!; // Value '08'
    // Place caret at start of day input
    act(() => {
      day.focus();
      // Simulate caret at start
      day.setSelectionRange(0, 0);
      fireEvent.keyDown(day, { key: 'Backspace' });
    });
    // Should have deleted last char of month (08 -> 0) keeping day intact
    expect(handleChange).toHaveBeenLastCalledWith('0/20/2023');
    expect(month.value).toBe('0');
    expect(day.value).toBe('20');
  });

  test('paste distributes digits across inputs', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <DateField
        dateFormat={SupportedDateFormat.US}
        label="Date of birth"
        onChange={handleChange}
      />
    );
    const labelNode = Array.from(container.querySelectorAll('*')).find(
      (element) => element.textContent === 'Date of birth'
    );
    act(() => {
      fireEvent.click(labelNode!);
    });
    const inputs = Array.from(container.querySelectorAll('input'));

    act(() => {
      fireEvent.paste(inputs[0]!, {
        clipboardData: {
          getData: () => '08202023',
        },
      } as unknown as ClipboardEvent);
    });

    // Should fill: 08 / 20 / 2023
    expect(handleChange).toHaveBeenLastCalledWith('08/20/2023');
  });

  test('fallback to simple input when unsupported format provided', () => {
    const handleChange = jest.fn();
    const { container } = render(<Controlled dateFormat="dd.MM.yyyy" onChange={handleChange} />);
    // Should render single input (no role button container present)
    expect(container.querySelectorAll('input').length).toBe(1);
    const input = container.querySelector('input');
    if (input) {
      act(() => {
        fireEvent.change(input, { target: { value: '2023-08-20' } });
      });
    }
    expect(handleChange).toHaveBeenCalledWith('2023-08-20');
  });

  test('UK format placeholders and value assembly', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled
        dateFormat={SupportedDateFormat.UK}
        label="Date of birth"
        onChange={handleChange}
      />
    );
    const labelNode = Array.from(container.querySelectorAll('*')).find(
      (element) => element.textContent === 'Date of birth'
    );
    act(() => {
      fireEvent.click(labelNode!);
    });
    const inputs = Array.from(container.querySelectorAll('input'));
    expect(inputs[0]?.getAttribute('placeholder')).toBe('DD');
    expect(inputs[1]?.getAttribute('placeholder')).toBe('MM');
    expect(inputs[2]?.getAttribute('placeholder')).toBe('YYYY');
    act(() => {
      fireEvent.input(inputs[0]!, { target: { value: '20' } });
      fireEvent.input(inputs[1]!, { target: { value: '08' } });
      fireEvent.input(inputs[2]!, { target: { value: '2023' } });
    });
    expect(handleChange).toHaveBeenLastCalledWith('20/08/2023');
  });

  test('ISO format placeholders, separator and value assembly', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled
        dateFormat={SupportedDateFormat.ISO}
        label="Date of birth"
        onChange={handleChange}
      />
    );
    const labelNode = Array.from(container.querySelectorAll('*')).find(
      (element) => element.textContent === 'Date of birth'
    );
    act(() => {
      fireEvent.click(labelNode!);
    });
    const inputs = Array.from(container.querySelectorAll('input'));
    expect(inputs[0]?.getAttribute('placeholder')).toBe('YYYY');
    expect(inputs[1]?.getAttribute('placeholder')).toBe('MM');
    expect(inputs[2]?.getAttribute('placeholder')).toBe('DD');
    // Check separator is '-'
    const separators = Array.from(container.querySelectorAll('span')).filter(
      (spanElement) => spanElement.textContent === '-'
    );
    expect(separators).toHaveLength(2);
    act(() => {
      fireEvent.input(inputs[0]!, { target: { value: '2023' } });
      fireEvent.input(inputs[1]!, { target: { value: '08' } });
      fireEvent.input(inputs[2]!, { target: { value: '20' } });
    });
    expect(handleChange).toHaveBeenLastCalledWith('2023-08-20');
  });
});
