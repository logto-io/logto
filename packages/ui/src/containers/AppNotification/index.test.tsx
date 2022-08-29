import { fireEvent } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';

import Notification from './index';

describe('Notification', () => {
  it('render Notification', () => {
    const notification = 'text notification';

    const { queryByText, getByText } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          notification,
        }}
      >
        <Notification />
      </SettingsProvider>
    );

    expect(queryByText(notification)).not.toBeNull();

    const closeButton = getByText('action.got_it');
    fireEvent.click(closeButton);
    expect(queryByText(notification)).toBeNull();
  });
});
