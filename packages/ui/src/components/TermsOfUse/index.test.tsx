import { render, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import TermsOfUse from '.';

describe('Terms of Use', () => {
  const onChange = jest.fn();
  const termsOfUseUrl = 'http://logto.dev/';
  const { t } = useTranslation();
  const prefix = t('description.agree_with_terms');

  beforeEach(() => {
    onChange.mockClear();
  });

  it('render Terms of User checkbox', () => {
    const { getByText, container } = render(
      <TermsOfUse name="terms" termsUrl={termsOfUseUrl} onChange={onChange} />
    );

    const element = getByText(prefix);

    fireEvent.click(element);

    expect(onChange).toBeCalledWith(true);

    const linkElement = container.querySelector('a');
    expect(linkElement).not.toBeNull();

    if (linkElement) {
      expect(linkElement.href).toEqual(termsOfUseUrl);
    }
  });
});
