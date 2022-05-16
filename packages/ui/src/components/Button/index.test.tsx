import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { mockSocialConnectorData } from '@/__mocks__/logto';

import SocialLinkButton from './SocialLinkButton';
import Button from './index';

describe('Button Component', () => {
  const onClick = jest.fn();

  beforeEach(() => {
    onClick.mockClear();
  });

  it('render Button', () => {
    const { queryByText, container } = render(<Button onClick={onClick}>foo</Button>);
    expect(queryByText('foo')).not.toBeNull();

    const button = container.querySelector('button');

    if (button) {
      fireEvent.click(button);
      expect(onClick).toBeCalled();
    }
  });

  it('render SocialLinkButton', () => {
    const connector = mockSocialConnectorData;
    const { queryByText, container } = render(
      <SocialLinkButton connector={connector} onClick={onClick} />
    );

    expect(queryByText(connector.name.en)).not.toBeNull();

    const button = container.querySelector('button');
    const icon = container.querySelector('img');

    if (icon) {
      expect(icon.src).toEqual(connector.logo);
    }

    if (button) {
      fireEvent.click(button);
      expect(onClick).toBeCalled();
    }
  });
});
