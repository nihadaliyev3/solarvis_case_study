import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import SignIn from  './Components/SignIn';
import SignUp from  './Components/SignUp';
import React, { useState, useEffect } from 'react';
import ProtectedRoute from './Components/ProtectedRoute';
import HomeComponent from './Components/HomeComponent';
import Items from './Components/Items';
import { jwtDecode } from 'jwt-decode';
import Layout from './Components/Layout';
import UsersTable from './Components/UsersTable';

const Roles = { ADMIN: 'Admin', SUPER_ADMIN: 'SuperAdmin', BASIC_USER: 'BasicUser' };

function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);


  return (
    <BrowserRouter>
        <Layout userRole={userRole}>
            <Routes>
              <Route path="/" element={<ProtectedRoute allowedRoles={[Roles.BASIC_USER, Roles.ADMIN, Roles.SUPER_ADMIN]} WrappedComponent={Items} />} />
              <Route path="/users" element={<ProtectedRoute allowedRoles={[Roles.BASIC_USER, Roles.ADMIN, Roles.SUPER_ADMIN]} WrappedComponent={UsersTable} />} />
              <Route path="/signin" element={<SignIn onSignInSuccess={(role) => setUserRole(role)} />} /> 
              <Route path="/signup" element={<SignUp />} />
              <Route path="/unauthorized" element={<HomeComponent />} />
            </Routes>
        </Layout>
    </BrowserRouter>
  );
}

export default App;
