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

  test('backspace clears previous field when empty', () => {
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

    // Focus last input and clear it with backspace until it moves to previous
    act(() => {
      inputs[2]!.focus();
      fireEvent.keyDown(inputs[2]!, { key: 'Backspace' }); // Clears year
    });
    expect(handleChange).toHaveBeenLastCalledWith('08/20/');

    // Now last input is empty, backspace again should move to previous and clear day
    act(() => {
      fireEvent.keyDown(inputs[2]!, { key: 'Backspace' });
    });
    expect(handleChange).toHaveBeenLastCalledWith('08//');

    // Finally clear the month field so that all parts empty => '' (not '//')
    act(() => {
      inputs[0]!.focus();
      fireEvent.keyDown(inputs[0]!, { key: 'Backspace' });
    });
    expect(handleChange).toHaveBeenLastCalledWith('');
    const emittedValuesAfterFullClear = handleChange.mock.calls.map((call) => call[0]);
    expect(emittedValuesAfterFullClear.includes('//')).toBe(false);
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
