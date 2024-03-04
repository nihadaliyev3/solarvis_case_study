import React, { useState } from 'react';
import { Nav, Navbar, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function NavigationBar({ userRole }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwtToken'); 
        // Reset any user-related state if needed 
        navigate('/signin'); // Redirect to home or login page
    };

    return (
    <Navbar collapseOnSelect expand="lg" bg="dark" data-bs-theme="dark" sticky="top">
      <Container>
        <Navbar.Brand href="/">SolarVis</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav variant="tabs" className="me-auto" defaultActiveKey="/" bg='light'>
            <Nav.Link href="/">Items</Nav.Link>
            <Nav.Link href="#pricing">Users</Nav.Link>
            <Nav.Link href="#profile">Profile</Nav.Link>
          </Nav>
          <Nav>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    );
}

export default NavigationBar;
