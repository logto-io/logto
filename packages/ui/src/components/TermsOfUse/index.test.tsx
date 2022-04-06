import { TermsOfUse as TermsOfUseType } from '@logto/schemas';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import TermsOfUse from '.';

describe('Terms of Use', () => {
  const onChange = jest.fn();
  const termsOfUse: TermsOfUseType = {
    enabled: true,
    contentUrl: 'http://logto.dev/',
  };
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const prefix = t('description.agree_with_terms');

  beforeEach(() => {
    onChange.mockClear();
  });

  it('render Terms of User checkbox', () => {
    const { getByText, container } = render(
      <TermsOfUse name="terms" termsOfUse={termsOfUse} onChange={onChange} />
    );

    const element = getByText(prefix);

    fireEvent.click(element);

    expect(onChange).toBeCalledWith(true);

    const linkElement = container.querySelector('a');
    expect(linkElement).not.toBeNull();

    if (linkElement) {
      expect(linkElement.href).toEqual(termsOfUse.contentUrl);
    }
  });

  it('render null with disabled terms', () => {
    const { container } = render(
      <TermsOfUse name="terms" termsOfUse={{ ...termsOfUse, enabled: false }} onChange={onChange} />
    );

    expect(container.children).toHaveLength(0);
  });
});
