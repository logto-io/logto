import { render, fireEvent, act, waitFor } from '@testing-library/react';
import { useState } from 'react';

import SelectField from '.';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { dir: () => 'ltr' },
  }),
}));

const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
];

// Controlled wrapper
const Controlled = (
  props: Readonly<
    Omit<React.ComponentProps<typeof SelectField>, 'onChange'> & {
      onChange?: (value: string) => void;
    }
  >
) => {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <SelectField
      {...props}
      value={value}
      onChange={(value) => {
        setValue(value);
        props.onChange?.(value);
      }}
    />
  );
};

const queryOption = (label: string) =>
  Array.from(document.querySelectorAll('[role="menuitem"], li, div')).find(
    (element) => element.textContent === label
  );

describe('SelectField', () => {
  test('click open and select by mouse', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled label="Favorite" name="favorite" options={options} onChange={handleChange} />
    );
    const input = container.querySelector('input[name="favorite"]')!;
    act(() => {
      fireEvent.click(input);
    });
    const banana = queryOption('Banana');
    expect(banana).toBeTruthy();
    act(() => {
      fireEvent.click(banana!);
    });
    expect(handleChange).toHaveBeenCalledWith('b');
    expect((input as HTMLInputElement).value).toBe('Banana');
  });

  test('ArrowDown first focuses first item then Enter selects', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled label="Favorite" name="favorite" options={options} onChange={handleChange} />
    );
    const input = container.querySelector('input[name="favorite"]')!;
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
    const first = queryOption('Apple');
    expect(first).toBeTruthy();
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(handleChange).toHaveBeenLastCalledWith('a');
    expect((input as HTMLInputElement).value).toBe('Apple');
  });

  test('ArrowUp first focuses last item then Space selects', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled label="Favorite" name="favorite" options={options} onChange={handleChange} />
    );
    const input = container.querySelector('input[name="favorite"]')!;
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });
    const last = queryOption('Cherry');
    expect(last).toBeTruthy();
    act(() => {
      fireEvent.keyDown(input, { key: ' ' });
    });
    expect(handleChange).toHaveBeenLastCalledWith('c');
    expect((input as HTMLInputElement).value).toBe('Cherry');
  });

  test('wrap-around ArrowDown navigation', async () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled label="Favorite" name="favorite" options={options} onChange={handleChange} />
    );
    const input = container.querySelector('input[name="favorite"]')!;
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }); // Apple
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }); // Banana
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }); // Cherry
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }); // Wrap to Apple
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' });
    }); // Select Apple
    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith('a');
    });
    // Reopen and ArrowUp wrap from first to last
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }); // Reopen -> Apple
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    }); // Wrap -> Cherry
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith('c');
    });
  });

  test('Escape closes without selection', async () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Controlled label="Favorite" name="favorite" options={options} onChange={handleChange} />
    );
    const input = container.querySelector('input[name="favorite"]')!;
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Escape' });
    });
    expect(handleChange).not.toHaveBeenCalled();
    // Ensure still functional after close
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith('a');
    });
  });
});
