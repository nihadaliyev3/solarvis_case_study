import React, { useState } from 'react';
import {Button, Modal, Form, Alert} from 'react-bootstrap';
import API_BASE_URL from '../config';

import axios from 'axios';

function CreateItemModal({ show, onHide, token }) {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState(''); 
  const [message, setMessage] = useState(null); 

  const handleSubmit = async (e) => {
    setMessage(null);
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/items/new_item`, {
        name: itemName,
        description: itemDescription
      }, { headers: {
            'Authorization': `Bearer ${token}`
          }
      });

      console.log(response); 

      
      setItemName('');
      setItemDescription('');
      setMessage("Success!");
      
      
    } catch (error) {
      console.error('Error creating item:', error);
      setMessage("Fail!");
    }
  };

  return (
    <Modal show={show} onHide={onHide}> 
      <Modal.Header closeButton>
          <Modal.Title>Create New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Item Name</Form.Label>
              <Form.Control 
                type="text" 
                value={itemName} 
                onChange={(e) => setItemName(e.target.value)} 
                required 
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Item Description</Form.Label>
              <Form.Control 
                type="text" 
                value={itemDescription} 
                onChange={(e) => setItemDescription(e.target.value)} 
              
              />
            </Form.Group>

            {message && (<Alert className="mb-2" variant="info" style={{ padding: '0.3rem', fontSize: '0.9rem' }}>{message}</Alert> )}

            <Button variant="primary" className="m-2" type="submit">
              Create
            </Button>
          </Form>
        </Modal.Body>
    </Modal>
  );
}

export default CreateItemModal;
