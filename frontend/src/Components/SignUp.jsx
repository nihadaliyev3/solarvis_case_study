import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import NewUser from './NewUser';
import './SignIn.css'

const SignUp = () => {

  const handleResponseFromChild = (data) => {
    console.log(data); 
  };

  return (
    <div className="sign-in-page">
        <Container style={{ width: '60%', margin: 'auto' }} >
            <Row className="justify-content-md-center">
                <Col>
                    <NewUser formName="Sign Up" onResponse={handleResponseFromChild}/> 
                </Col>
            </Row>
        </Container>
    </div>
  );
};

export default SignUp;
