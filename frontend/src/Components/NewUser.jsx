import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Or your preferred HTTP library
import API_BASE_URL from '../config';

const NewUser = ({formName, onResponse}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [role, setRole] = useState('basic user'); 
  const [validated, setValidated] = useState(false); 
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Check if the repeat password matches the new password
    if (repeatedPassword !== e.target.value) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };

  const handleRepeatPasswordChange = (e) => {
    setRepeatedPassword(e.target.value);
    // Check if the repeat password matches the new password
    if (password !== e.target.value) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccess(false);

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }
    setValidated(true);

    // Only send the request if frontend validation passes
    if (form.checkValidity() && password === repeatedPassword) { 
      try {
        const response = await axios.post(`${API_BASE_URL}/signup`, {
          firstName,
          lastName,
          email,
          password,
          role
        });
        onResponse(response.data);
        setSuccess(true);
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.detail); // Example:  Assuming your API returns an error message
       } else {
          setErrorMessage('A network error occurred. Please try again.'); 
       }
      }
    }
  };

  return (
      <Form className="shadow p-5 w-auto bg-dark rounded border border-secondary" noValidate validated={validated} onSubmit={handleSubmit}>
        <div className="d-flex mb-3 justify-content-center">
            <h2 className="form-heading">{formName}</h2>
        </div>
        <Row>
          <Col>
          <Form.Group className="mb-3" controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control 
              type="text" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)} 
              required 
              placeholder="First Name" 
            />
            <Form.Control.Feedback type="invalid">
              Please provide first name.
            </Form.Control.Feedback> 
          </Form.Group>
          </Col>
          <Col>
          <Form.Group className="mb-3" controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control 
              type="text" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)} 
              required
              placeholder="Last Name" 
            />
            <Form.Control.Feedback type="invalid">
              Please provide last name.
            </Form.Control.Feedback> 
          </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Employee Role</Form.Label>
              <Form.Select isInvalid={role === ''} required value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select an employee role</option>
                <option value="BasicUser">User</option>
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">Super Admin</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid"> {/* Feedback message */}
                Please select an employee role.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required  
                placeholder="Email"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email.
              </Form.Control.Feedback> 
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="Password"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="repeatedPassword">
              <Form.Label>Repeat Password</Form.Label>
              <Form.Control
                type="password"
                value={repeatedPassword}
                onChange={handleRepeatPasswordChange}
                required
                isInvalid={passwordMatchError}
                placeholder="Repeat Password"
              />
              {passwordMatchError && (
                <Form.Control.Feedback type="invalid">
                  Passwords do not match.
                </Form.Control.Feedback>
              )}
            </Form.Group>
            </Col>
        </Row>
        {errorMessage && (<Alert className="mb-2" variant="danger" style={{ padding: '0.3rem', fontSize: '0.9rem', marginTop:'3rem' }}>{errorMessage}</Alert> )}
        {success && (<Alert className="mb-2" variant="success" style={{ padding: '0.3rem', fontSize: '0.9rem', marginTop:'3rem' }}>
            <p className="text-center mt-3" style={{ fontSize: '1.2rem', color: '#6B728E'}}> 
                  User created successfully!  
                  {formName=="Sign Up" && <Link className='sign-up-link' to="/">Sign In</Link> }
            </p>
        </Alert> )}
        <div className="d-grid gap-2 p-3">
          <Button className="button" variant="primary" type="submit">
            {formName}
          </Button>
        </div>
      </Form>
  );
};

export default NewUser;
