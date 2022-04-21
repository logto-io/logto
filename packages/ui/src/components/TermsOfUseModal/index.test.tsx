import { render } from '@testing-library/react';
import React from 'react';

import TermsOfUseModal from '.';

describe('TermsOfUseModal', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  it('render properly', () => {
    const { queryByText } = render(
      <TermsOfUseModal
        isOpen
        termsUrl="https://www.google.com"
        onConfirm={onConfirm}
        onClose={onCancel}
      />
    );

    expect(queryByText('description.agree_with_terms_modal')).not.toBeNull();
  });
});
