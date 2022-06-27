import { screen } from '@testing-library/react';
import React from 'react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';

import TermsOfUseIframeModal from '.';

describe('TermsOfUseModal', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  it('render properly', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <TermsOfUseIframeModal isOpen onConfirm={onConfirm} onClose={onCancel} />
      </SettingsProvider>
    );

    expect(queryByText('action.agree')).not.toBeNull();

    const iframe = screen.queryByRole('iframe');

    expect(iframe).not.toBeNull();

    if (iframe) {
      expect(iframe).toHaveProperty('src', mockSignInExperienceSettings.termsOfUse.contentUrl);
    }
  });
});
