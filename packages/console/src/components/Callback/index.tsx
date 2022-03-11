import { useLogto } from '@logto/react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const { isAuthenticated, isLoading } = useLogto();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return <p>Redirecting...</p>;
};

export default Callback;
