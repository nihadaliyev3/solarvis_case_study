import  React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './SignIn.css'
import API_BASE_URL from '../config';
import { jwtDecode } from 'jwt-decode';


const SignIn = ({ onSignInSuccess }) => {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null); 
  
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        navigate('/'); // Redirect to home if token exists
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, formData);

      // Store JWT token (e.g., in localStorage)
      localStorage.setItem('jwtToken', response.data.access_token);

      // Redirect to a protected area of your app or update UI
      console.log('Sign in successful'); 

      const decodedToken = jwtDecode(response.data.access_token);
      onSignInSuccess(decodedToken.role); 

      window.location.href = 'http://localhost:3000'; 
      

    } catch (error) {
      setErrorMessage('Invalid username or password'); // Handle error
    }
  };

  return (
    <div className="sign-in-page">
    <Container style={{ width: '40%', margin: 'auto' }} >
      <Row className="justify-content-md-center">
        <Col> 
          <Form className="shadow p-5 w-auto bg-dark rounded border border-secondary" onSubmit={handleSubmit}>
          <div className="d-flex mb-3 justify-content-center">
            <h2 className="form-heading">Sign In</h2>
          </div>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Control 
                required
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Email" 
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control 
                required
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" 
              />
            </Form.Group>
            {errorMessage && (<Alert className="mb-2" variant="danger" style={{ padding: '0.3rem', fontSize: '0.9rem' }}>{errorMessage}</Alert> )}
            <div className="d-flex justify-content-center"> 
              <Button variant="outline-secondary" size='xl' type="submit">
                Sign In
              </Button>
            </div>
            <p className="text-center mt-3" style={{ fontSize: '1.2rem', color: '#6B728E'}}> 
              Don't have an account?  
              <Link className='sign-up-link' to="/signup">Sign Up</Link> 
            </p>
          </Form>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default SignIn;
