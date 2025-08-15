import {
  CustomProfileFieldType,
  SupportedDateFormat,
  type CustomProfileField,
} from '@logto/schemas';
import { render, fireEvent, waitFor, act } from '@testing-library/react';

import ExtraProfileForm from '.';
import {
  openAndSetDate,
  collectErrorTexts,
  buildField,
  queryInput,
  querySelectorAll,
} from './test-helpers';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { types?: string[] }) => options?.types?.[0] ?? key,
    i18n: { dir: () => 'ltr' },
  }),
}));

describe('ExtraProfileForm validation', () => {
  const renderForm = (fields: CustomProfileField[]) => {
    const onSubmit = jest.fn(async () => {
      // No operation
    });
    const utils = render(<ExtraProfileForm customProfileFields={fields} onSubmit={onSubmit} />);
    return { ...utils, onSubmit };
  };

  describe('Text', () => {
    test('too short', async () => {
      const field = buildField({
        name: 'nickname',
        label: 'Nickname',
        config: { minLength: 2, maxLength: 5 },
      });
      const { container, getByText } = renderForm([field]);
      const input = queryInput(container, 'input[name="nickname"]');
      act(() => {
        fireEvent.change(input, { target: { value: 'A' } });
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(getByText('error.invalid_min_max_length')).toBeTruthy();
      });
    });

    test('too long', async () => {
      const field = buildField({
        name: 'nickname',
        label: 'Nickname',
        config: { minLength: 2, maxLength: 5 },
      });
      const { container, getByText } = renderForm([field]);
      const input = queryInput(container, 'input[name="nickname"]');
      act(() => {
        fireEvent.change(input, { target: { value: 'ABCDEFG' } });
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(getByText('error.invalid_min_max_length')).toBeTruthy();
      });
    });
  });

  describe('Number', () => {
    test('below min and above max then valid', async () => {
      const field = buildField({
        name: 'age',
        type: CustomProfileFieldType.Number,
        label: 'Age',
        config: { minValue: 10, maxValue: 20 },
      });
      const { container, getByText, rerender, onSubmit } = renderForm([field]);
      const input = queryInput(container, 'input[name="age"]');
      act(() => {
        fireEvent.change(input, { target: { value: '5' } });
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(getByText('error.invalid_min_max_input')).toBeTruthy();
      });
      act(() => {
        fireEvent.change(input, { target: { value: '25' } });
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(getByText('error.invalid_min_max_input')).toBeTruthy();
      });
      expect(onSubmit).not.toHaveBeenCalled();
      act(() => {
        fireEvent.change(input, { target: { value: '15' } });
        fireEvent.blur(input); // Trigger reValidate on blur
      });
      await waitFor(() => {
        expect(collectErrorTexts(container)).not.toContain('error.invalid_min_max_input');
      });
      act(() => {
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
      rerender(<ExtraProfileForm customProfileFields={[field]} onSubmit={onSubmit} />);
    });
  });

  describe('Regex', () => {
    test('invalid format', async () => {
      const field = buildField({
        name: 'employeeCode',
        type: CustomProfileFieldType.Regex,
        label: 'Employee Code',
        config: { format: '^[A-Z]{3}-\\d{2}$' },
      });
      const { container, getByText, onSubmit } = renderForm([field]);
      const input = queryInput(container, 'input[name="employeeCode"]');
      act(() => {
        fireEvent.change(input, { target: { value: 'ABC12' } });
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(collectErrorTexts(container)).toContain('Employee Code');
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('valid format passes', async () => {
      const field = buildField({
        name: 'employeeCode',
        type: CustomProfileFieldType.Regex,
        label: 'Employee Code',
        config: { format: '^[A-Z]{3}-\\d{2}$' },
      });
      const { container, getByText, onSubmit } = renderForm([field]);
      const input = queryInput(container, 'input[name="employeeCode"]');
      act(() => {
        fireEvent.change(input, { target: { value: 'ABC-12' } });
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(collectErrorTexts(container)).not.toContain('Employee Code');
      });
    });
  });

  describe('Url', () => {
    test('invalid url', async () => {
      const field = buildField({
        name: 'website',
        type: CustomProfileFieldType.Url,
        label: 'Website',
      });
      const { container, getByText, onSubmit } = renderForm([field]);
      const input = queryInput(container, 'input[name="website"]');
      act(() => {
        fireEvent.change(input, { target: { value: 'not-a-url' } });
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(collectErrorTexts(container)).toContain('Website');
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('valid url passes', async () => {
      const field = buildField({
        name: 'website',
        type: CustomProfileFieldType.Url,
        label: 'Website',
      });
      const { container, getByText, onSubmit } = renderForm([field]);
      const input = queryInput(container, 'input[name="website"]');
      act(() => {
        fireEvent.change(input, { target: { value: 'https://example.com' } });
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(collectErrorTexts(container)).not.toContain('Website');
      });
    });
  });

  describe('Select', () => {
    test('required not selected', async () => {
      const field = buildField({
        name: 'favoriteColor',
        type: CustomProfileFieldType.Select,
        label: 'Favorite Color',
        config: { options: [{ value: 'red' }, { value: 'green' }] },
      });
      const { getByText, onSubmit } = renderForm([field]);
      act(() => {
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(collectErrorTexts(document)).toContain('Favorite Color');
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('select valid option', async () => {
      const field = buildField({
        name: 'favoriteColor',
        type: CustomProfileFieldType.Select,
        label: 'Favorite Color',
        config: { options: [{ value: 'red' }, { value: 'green' }] },
      });
      const { container, getByText, onSubmit } = renderForm([field]);
      const input = queryInput(container, 'input[name="favoriteColor"]');
      act(() => {
        fireEvent.click(input);
      });
      const option = await waitFor(() =>
        querySelectorAll(document, '[role="menuitem"], li').find(
          (element) => element.textContent === 'red'
        )
      );
      if (!option) {
        throw new Error('Option not found');
      }
      act(() => {
        fireEvent.click(option);
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(collectErrorTexts(document)).not.toContain('Favorite Color');
      });
    });
  });

  describe('Date', () => {
    test('invalid date parts', async () => {
      const field = buildField({
        name: 'birthdate',
        type: CustomProfileFieldType.Date,
        label: 'Birthdate',
        config: { format: SupportedDateFormat.ISO },
      });
      const { container, getByText, onSubmit } = renderForm([field]);
      await openAndSetDate(container, { y: '2023', m: '13', d: '40' });
      act(() => {
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(collectErrorTexts(container)).toContain('Birthdate');
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('valid date passes', async () => {
      const field = buildField({
        name: 'birthdate',
        type: CustomProfileFieldType.Date,
        label: 'Birthdate',
        config: { format: SupportedDateFormat.ISO },
      });
      const { container, getByText, onSubmit } = renderForm([field]);
      await openAndSetDate(container, { y: '2023', m: '08', d: '20' });
      act(() => {
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(collectErrorTexts(container)).not.toContain('Birthdate');
      });
    });
  });

  describe('Fullname', () => {
    const fullnameField = buildField({
      name: 'fullname',
      type: CustomProfileFieldType.Fullname,
      label: 'Full name',
      config: {
        parts: [
          { name: 'givenName', type: CustomProfileFieldType.Text, enabled: true, required: true },
          { name: 'middleName', type: CustomProfileFieldType.Text, enabled: true, required: false },
          { name: 'familyName', type: CustomProfileFieldType.Text, enabled: true, required: true },
        ],
      },
    });

    test('missing required parts', async () => {
      const { getByText, onSubmit } = renderForm([fullnameField]);
      act(() => {
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(collectErrorTexts(document)).toContain('Full name');
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('fills required parts passes', async () => {
      const { container, getByText, onSubmit } = renderForm([fullnameField]);
      const given = queryInput(container, 'input[name="givenName"]');
      const family = queryInput(container, 'input[name="familyName"]');
      act(() => {
        fireEvent.change(given, { target: { value: 'Alice' } });
        fireEvent.change(family, { target: { value: 'Doe' } });
        fireEvent.click(getByText('action.continue'));
      });
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(collectErrorTexts(document)).not.toContain('Full name');
      });
    });
  });
});
