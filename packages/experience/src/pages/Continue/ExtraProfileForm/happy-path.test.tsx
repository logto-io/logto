import {
  CustomProfileFieldType,
  SupportedDateFormat,
  type CustomProfileField,
} from '@logto/schemas';
import { render, fireEvent, waitFor, act } from '@testing-library/react';

import ExtraProfileForm from '.';
import { buildField, queryInput, querySelectorAll, waitForStateUpdate } from './test-helpers';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { types?: string[] }) => options?.types?.[0] ?? key,
    i18n: { dir: () => 'ltr' },
  }),
}));

describe('ExtraProfileForm', () => {
  test('fills and submits all supported profile field types', async () => {
    const onSubmit = jest.fn(async (_values: unknown) => {
      // No operation
    });

    const customProfileFields: CustomProfileField[] = [
      // Text
      buildField({
        name: 'nickname',
        label: 'Nickname',
        config: { minLength: 2, maxLength: 30 },
      }),
      // Number
      buildField({
        name: 'age',
        type: CustomProfileFieldType.Number,
        label: 'Age',
        config: { minValue: 1, maxValue: 120 },
      }),
      // Checkbox
      buildField({
        name: 'subscribeEmail',
        type: CustomProfileFieldType.Checkbox,
        label: 'Subscribe Email',
        required: false,
      }),
      // Url
      buildField({
        name: 'website',
        type: CustomProfileFieldType.Url,
        label: 'Website',
        required: false,
      }),
      // Regex (employee code pattern ABC-12)
      buildField({
        name: 'employeeCode',
        type: CustomProfileFieldType.Regex,
        label: 'Employee Code',
        config: { format: '^[A-Z]{3}-\\d{2}$' },
      }),
      // Select
      buildField({
        name: 'favoriteColor',
        type: CustomProfileFieldType.Select,
        label: 'Favorite Color',
        config: { options: [{ value: 'red' }, { value: 'green' }, { value: 'blue' }] },
      }),
      // Date
      buildField({
        name: 'birthdate',
        type: CustomProfileFieldType.Date,
        label: 'Birthdate',
        config: { format: SupportedDateFormat.ISO },
      }),
      // Fullname (3 parts)
      buildField({
        name: 'fullname',
        type: CustomProfileFieldType.Fullname,
        label: 'Full name',
        config: {
          parts: [
            {
              name: 'givenName',
              type: CustomProfileFieldType.Text,
              enabled: true,
              required: true,
            },
            {
              name: 'middleName',
              type: CustomProfileFieldType.Text,
              enabled: true,
              required: false,
            },
            {
              name: 'familyName',
              type: CustomProfileFieldType.Text,
              enabled: true,
              required: true,
            },
          ],
        },
      }),
      // Address (omit formatted to compute automatically)
      buildField({
        name: 'address',
        type: CustomProfileFieldType.Address,
        label: 'Address',
        config: {
          parts: [
            {
              name: 'streetAddress',
              type: CustomProfileFieldType.Text,
              enabled: true,
              required: true,
            },
            {
              name: 'locality',
              type: CustomProfileFieldType.Text,
              enabled: true,
              required: true,
            },
            {
              name: 'region',
              type: CustomProfileFieldType.Text,
              enabled: true,
              required: true,
            },
            {
              name: 'postalCode',
              type: CustomProfileFieldType.Text,
              enabled: true,
              required: true,
            },
            {
              name: 'country',
              type: CustomProfileFieldType.Text,
              enabled: true,
              required: true,
            },
          ],
        },
      }),
    ];

    const { container, getByText } = render(
      <ExtraProfileForm customProfileFields={customProfileFields} onSubmit={onSubmit} />
    );

    // Fill fullname parts
    const givenNameInput = queryInput(container, 'input[name="givenName"]');
    const middleNameInput = queryInput(container, 'input[name="middleName"]');
    const familyNameInput = queryInput(container, 'input[name="familyName"]');
    act(() => {
      fireEvent.change(givenNameInput, { target: { value: 'Alice' } });
      fireEvent.change(middleNameInput, { target: { value: 'B' } });
      fireEvent.change(familyNameInput, { target: { value: 'Carroll' } });
    });
    // Text (nickname)
    const nicknameInput = queryInput(container, 'input[name="nickname"]');
    act(() => {
      fireEvent.change(nicknameInput, { target: { value: 'Ali' } });
    });
    // Number (age)
    const ageInput = queryInput(container, 'input[name="age"]');
    act(() => {
      fireEvent.change(ageInput, { target: { value: '25' } });
    });
    // Checkbox (custom component rendered without native checkbox name attr; query by role and label span)
    const subscribeCheckbox = querySelectorAll(container, '[role="checkbox"]').find((element) =>
      element.textContent?.includes('Subscribe Email')
    );
    if (!subscribeCheckbox) {
      throw new Error('Subscribe Email checkbox not found');
    }
    act(() => {
      fireEvent.click(subscribeCheckbox);
    });
    // Url
    const websiteInput = queryInput(container, 'input[name="website"]');
    act(() => {
      fireEvent.change(websiteInput, { target: { value: 'https://example.com' } });
    });

    // Regex
    const employeeCodeInput = queryInput(container, 'input[name="employeeCode"]');
    act(() => {
      fireEvent.change(employeeCodeInput, { target: { value: 'ABC-12' } });
    });

    // Select (custom dropdown, open then pick option)
    const favoriteColorInput = queryInput(container, 'input[name="favoriteColor"]');
    act(() => {
      fireEvent.click(favoriteColorInput);
    });
    const option = await waitFor(() =>
      querySelectorAll(document, '[role="menuitem"], li').find(
        (element) => element.textContent === 'green'
      )
    );
    if (!option) {
      throw new Error('Green option not found');
    }
    act(() => {
      fireEvent.click(option);
    });
    // Allow any state updates from select to flush
    await waitForStateUpdate();

    // Address parts
    const streetAddress = queryInput(container, 'input[name="address.streetAddress"]');
    const locality = queryInput(container, 'input[name="address.locality"]');
    const region = queryInput(container, 'input[name="address.region"]');
    const postalCode = queryInput(container, 'input[name="address.postalCode"]');
    const country = queryInput(container, 'input[name="address.country"]');
    act(() => {
      fireEvent.change(streetAddress, { target: { value: '123 Main St' } });
      fireEvent.change(locality, { target: { value: 'Springfield' } });
      fireEvent.change(region, { target: { value: 'IL' } });
      fireEvent.change(postalCode, { target: { value: '62701' } });
      fireEvent.change(country, { target: { value: 'US' } });
    });

    // Date (birthdate) - click label then fill parts (YYYY-MM-DD)
    const birthdateLabel = Array.from(container.querySelectorAll('*')).find(
      (element) => element.textContent === 'Birthdate'
    );
    if (!birthdateLabel) {
      throw new Error('Birthdate label not found');
    }
    act(() => {
      fireEvent.click(birthdateLabel);
    });
    await waitForStateUpdate();
    const dateInputs = Array.from(container.querySelectorAll('input')).filter((element) => {
      const placeholder = element.getAttribute('placeholder') ?? '';
      return ['YYYY', 'MM', 'DD'].includes(placeholder);
    });
    const getDateInput = (ph: string): HTMLInputElement => {
      const found = dateInputs.find((i) => i.getAttribute('placeholder') === ph);
      if (!(found instanceof HTMLInputElement)) {
        throw new TypeError(`Date input ${ph} not found`);
      }
      return found;
    };
    const yearInput = getDateInput('YYYY');
    const monthInput = getDateInput('MM');
    const dayInput = getDateInput('DD');
    act(() => {
      fireEvent.input(yearInput, { target: { value: '2023' } });
      fireEvent.input(monthInput, { target: { value: '08' } });
      fireEvent.input(dayInput, { target: { value: '20' } });
    });

    // Submit
    const submitButton = getByText('action.continue');
    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    type SubmittedForm = {
      givenName: string;
      middleName?: string;
      familyName: string;
      nickname: string;
      age: string;
      subscribeEmail: string;
      website?: string;
      employeeCode: string;
      favoriteColor: string;
      birthdate: string;
      address: {
        streetAddress: string;
        locality: string;
        region: string;
        postalCode: string;
        country: string;
        formatted: string;
      };
    };
    const submitted = onSubmit.mock.calls[0]?.[0] as SubmittedForm;
    expect(submitted).toBeTruthy();

    expect(submitted.givenName).toBe('Alice');
    expect(submitted.middleName).toBe('B');
    expect(submitted.familyName).toBe('Carroll');
    expect(submitted.nickname).toBe('Ali');
    expect(submitted.age).toBe('25');
    expect(submitted.subscribeEmail).toBe('true');
    expect(submitted.website).toBe('https://example.com');
    expect(submitted.employeeCode).toBe('ABC-12');
    expect(submitted.favoriteColor).toBe('green');
    expect(submitted.birthdate).toBe('2023-08-20');
    expect(submitted.address).toBeDefined();
    expect(submitted.address.streetAddress).toBe('123 Main St');
    expect(submitted.address.locality).toBe('Springfield');
    expect(submitted.address.region).toBe('IL');
    expect(submitted.address.postalCode).toBe('62701');
    expect(submitted.address.country).toBe('US');
    expect(submitted.address.formatted).toBe('123 Main St, Springfield, IL, 62701, US');
  });
});
