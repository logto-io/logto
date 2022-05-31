import { useHandleSignInCallback } from '@logto/react';
import React from 'react';

const Callback = () => {
  const { error, isAuthenticated } = useHandleSignInCallback('.');

  if (isAuthenticated) {
    const { href } = window.location;
    window.location.assign(href.slice(0, href.indexOf('?')));

    return null;
  }

  if (error) {
    return (
      <div>
        Error Occurred:
        <br />
        {error.message}
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default Callback;
