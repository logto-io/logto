import { useHandleSignInCallback } from '@logto/react';
import React from 'react';

const Callback = () => {
  const { error } = useHandleSignInCallback(() => {
    window.location.assign('/demo-app');
  });

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
