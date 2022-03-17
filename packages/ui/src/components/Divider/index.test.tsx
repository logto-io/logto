import { render } from '@testing-library/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Divider from '.';

describe('Divider', () => {
  const { t } = useTranslation();

  it('render with content', () => {
    const { queryByText } = render(<Divider label="sign_in.continue_with" />);
    expect(queryByText(t('sign_in.continue_with'))).not.toBeNull();
  });
});
