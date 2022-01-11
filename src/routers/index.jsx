import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import LogIn from 'pages/LogIn';
import SignUp from 'pages/SignUp';
import Home from 'pages/Home';
import SecuredRoute from './SecuredRoute';

const MainRouters = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<SecuredRoute />}>
        <Route exact path="/home" element={<Home />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </Router>
);

export default MainRouters;
