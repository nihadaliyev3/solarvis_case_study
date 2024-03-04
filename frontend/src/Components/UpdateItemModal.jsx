import React, { useState } from 'react';
import {Button, Modal, Form, Alert} from 'react-bootstrap';
import API_BASE_URL from '../config';

import axios from 'axios';

function UpdateItemModal({ show, onHide, token, onUpdate, item }) {
  const [itemName, setItemName] = useState(item.name);
  const [itemDescription, setItemDescription] = useState(item.description); 
  const [message, setMessage] = useState(null); 

  const handleSubmit = async (e) => {
    setMessage(null);
    e.preventDefault();

    if (itemName===item.name && itemDescription===item.description){
      setMessage("No Change");
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/items/${item.id}`, {
        name: itemName,
        description: itemDescription
      }, { headers: {
            'Authorization': `Bearer ${token}`
          }
      });

      console.log(response); 

      const updatedItem = response.data;
      
      setMessage("Success!");
      updatedItem['user_email'] = item.user_email;
      onUpdate(updatedItem);
      
      
    } catch (error) {
      console.error('Error updating item:', error);
      setMessage("Fail!");
    }
  };

  return (
    <Modal show={show} onHide={onHide}> 
      <Modal.Header closeButton>
          <Modal.Title>Update {item.name}</Modal.Title>
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
              Update
            </Button>
          </Form>
        </Modal.Body>
    </Modal>
  );
}

export default UpdateItemModal;
