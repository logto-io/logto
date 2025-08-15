import { CustomProfileFieldType, type CustomProfileField } from '@logto/schemas';
import { act, fireEvent } from '@testing-library/react';

export const waitForStateUpdate = async () => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
};

export const buildField = (field: Partial<CustomProfileField>): CustomProfileField => ({
  tenantId: 'tenant',
  id: field.id ?? field.name ?? 'id',
  name: field.name ?? 'name',
  type: field.type ?? CustomProfileFieldType.Text,
  label: field.label ?? 'label',
  description: field.description ?? null,
  required: field.required ?? true,
  config: field.config ?? {},
  createdAt: Date.now(),
  sieOrder: 0,
  ...field,
});

export const openAndSetDate = async (
  container: HTMLElement,
  values: { y?: string; m?: string; d?: string }
) => {
  // Activate date inputs by clicking the visible label text within NotchedBorder
  const labelElement = Array.from(container.querySelectorAll('*')).find(
    (element) => element.textContent === 'Birthdate'
  );
  if (labelElement) {
    act(() => {
      fireEvent.click(labelElement);
    });
  }
  await waitForStateUpdate();
  const inputs = Array.from(container.querySelectorAll('input')).filter((input) =>
    ['YYYY', 'MM', 'DD'].includes(input.getAttribute('placeholder') ?? '')
  );
  const byPlaceholder = (placeholder: string) => {
    const found = inputs.find((input) => input.getAttribute('placeholder') === placeholder);
    if (!found) {
      throw new Error('missing ' + placeholder);
    }
    return found;
  };
  act(() => {
    if (values.y) {
      fireEvent.input(byPlaceholder('YYYY'), { target: { value: values.y } });
    }
    if (values.m) {
      fireEvent.input(byPlaceholder('MM'), { target: { value: values.m } });
    }
    if (values.d) {
      fireEvent.input(byPlaceholder('DD'), { target: { value: values.d } });
    }
  });
};

export const collectErrorTexts = (root: HTMLElement | Document): string[] => {
  const elements = Array.from(root.querySelectorAll('[role="alert"], .errorMessage, .error'));
  return elements.map((element) => element.textContent?.trim() ?? '').filter(Boolean);
};

export const queryInput = (root: ParentNode, selector: string) => {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Selector not found: ${selector}`);
  }
  if (!(element instanceof HTMLInputElement)) {
    throw new TypeError(`${selector} is not a ${HTMLInputElement.name}`);
  }
  return element;
};

export const querySelectorAll = (root: ParentNode, selector: string): HTMLElement[] => {
  const elements = Array.from(root.querySelectorAll(selector));
  if (elements.length === 0) {
    throw new Error(`Selector not found: ${selector}`);
  }
  if (!elements.every((element) => element instanceof HTMLElement)) {
    throw new TypeError(`${selector} is not a ${HTMLElement.name}`);
  }
  return elements;
};
