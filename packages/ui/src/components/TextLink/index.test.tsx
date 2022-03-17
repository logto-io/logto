import { render } from '@testing-library/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import TextLink from '.';

describe('TextLink', () => {
  it('render with children', () => {
    const { queryByText } = render(<TextLink href="#">foo</TextLink>);
    expect(queryByText('foo')).not.toBeNull();
  });

  it('render with i18nKey', () => {
    const { queryByText } = render(<TextLink href="#" text="sign_in.action" />);
    const { t } = useTranslation();
    expect(queryByText(t('sign_in.action'))).not.toBeNull();
  });
});
