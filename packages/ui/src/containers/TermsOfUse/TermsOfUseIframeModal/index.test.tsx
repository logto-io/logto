import { render, screen } from '@testing-library/react';
import React from 'react';

import TermsOfUseIframeModal from '.';

describe('TermsOfUseModal', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  it('render properly', () => {
    const { queryByText } = render(
      <TermsOfUseIframeModal
        isOpen
        termsUrl="https://www.google.com/"
        onConfirm={onConfirm}
        onClose={onCancel}
      />
    );

    expect(queryByText('action.agree')).not.toBeNull();

    const iframe = screen.queryByRole('iframe');

    expect(iframe).not.toBeNull();

    if (iframe) {
      expect(iframe).toHaveProperty('src', 'https://www.google.com/');
    }
  });
});
