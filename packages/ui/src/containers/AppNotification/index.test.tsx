import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { appNotificationStorageKey } from '@/utils/session-storage';

import AppNotification from '.';

describe('AppNotification', () => {
  it('render properly', () => {
    const message = 'This is a notification message';
    sessionStorage.setItem(appNotificationStorageKey, message);
    const { queryByText, getByText } = render(<AppNotification />);

    expect(queryByText(message)).not.toBeNull();

    const closeLink = getByText('action.got_it');

    expect(closeLink).not.toBeNull();

    fireEvent.click(closeLink);

    expect(queryByText(message)).toBeNull();
  });
});
