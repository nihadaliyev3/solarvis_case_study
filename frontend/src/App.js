import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import SignIn from  './Components/SignIn';
import SignUp from  './Components/SignUp';
import React from 'react';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} /> 
        <Route path="/signup" element={<SignUp />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
