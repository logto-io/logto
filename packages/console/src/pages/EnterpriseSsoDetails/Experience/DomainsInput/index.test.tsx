import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import DomainsInput from './index';

// Mock styles
jest.mock('./index.module.scss', () => ({
  input: 'mock-input-class',
  tag: 'mock-tag-class',
  info: 'mock-info-class',
}));

// Mock dependencies
jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
}));

// Mock MultiOptionInput
jest.mock('@/components/MultiOptionInput', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ validateInput, onChange, values, placeholder }: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState('');
    return (
      <div data-testid="multi-option-input">
        <div data-testid="values-count">{values.length}</div>
        <div data-testid="placeholder">{placeholder}</div>
        <input
          data-testid="input"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
        <button
          data-testid="add-btn"
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            const result = validateInput(value);
            if (result && typeof result !== 'string' && result.value) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
              onChange([...values, result.value]);
            }
          }}
        >
          Add
        </button>
      </div>
    );
  },
}));

// Mock utils to avoid schema dependencies
jest.mock('./utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  domainOptionsParser: (values: any[]) => ({ values, errorMessage: undefined }),
}));

// Mock shared dependencies
jest.mock(
  '@logto/shared/universal',
  () => ({
    generateStandardShortId: () => 'mock-id',
  }),
  { virtual: true }
);

jest.mock(
  '@silverhand/essentials',
  () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, unicorn/prefer-logical-operator-over-ternary
    conditional: (condition: any) => (condition ? condition : undefined),
    isKeyInObject: () => true,
  }),
  { virtual: true }
);

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'placeholder_key' ? 'Enter domain' : key),
  }),
}));

const mockSetError = jest.fn();
const mockClearErrors = jest.fn();

describe('DomainsInput', () => {
  const defaultProps = {
    values: [],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFormContext as jest.Mock).mockReturnValue({
      setError: mockSetError,
      clearErrors: mockClearErrors,
    });
  });

  it('renders correctly', () => {
    render(<DomainsInput {...defaultProps} placeholder="placeholder_key" />);
    // Check for existence
    expect(screen.getByTestId('multi-option-input')).toBeTruthy();
  });

  it('passes values correctly', () => {
    const values = [{ id: '1', value: 'example.com' }];
    render(<DomainsInput {...defaultProps} values={values} />);
    // Check text content
    expect(screen.getByTestId('values-count').textContent).toBe('1');
  });

  it('handles validation and adding via mocked interaction', () => {
    const onChange = jest.fn();
    render(<DomainsInput {...defaultProps} onChange={onChange} />);

    fireEvent.change(screen.getByTestId('input'), { target: { value: 'test.com' } });
    screen.getByTestId('add-btn').click();

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ value: 'test.com' })])
    );
  });

  it('blocks invalid domains', () => {
    const onChange = jest.fn();
    render(<DomainsInput {...defaultProps} onChange={onChange} />);

    fireEvent.change(screen.getByTestId('input'), { target: { value: 'invalid' } });
    screen.getByTestId('add-btn').click();

    expect(onChange).not.toHaveBeenCalled();
  });
});
