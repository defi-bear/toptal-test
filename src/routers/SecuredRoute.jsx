import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { useAuth } from 'hooks/useAuth';

const SecuredRoute = () => {
  const auth = useAuth();

  return auth && auth.user ? <Outlet /> : <Navigate to="/" />;
};

export default SecuredRoute;
