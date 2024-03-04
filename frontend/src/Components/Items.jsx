// ItemsComponent.js
import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import CreateItemModal from './CreateItemModal'; 
import API_BASE_URL from '../config';
import axios from 'axios';

const Items = ({ userRole }) => {
  const [items, setItems] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const token = localStorage.getItem('jwtToken');
  
  useEffect(() => {
    if (!token){
      return;
    }
    const fetchItems = async () => {
      let data=[];
      try{
        const response = await axios.get(`${API_BASE_URL}/items/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (typeof(response.data)==='object'){
        data = response.data;
        }
      }
      catch (error){
        console.log(error);
      }
      setItems(data); 
    };

    fetchItems();
  }, []); 


  async function handleDelete(itemId) {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.delete(`${API_BASE_URL}/items/delete/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log("Successfully deleted!")
      setItems(items.filter(item => item.id !== itemId));  
    } catch (error) {
      console.error('Error deleting item:', error);
      if (error.response && error.response.status === 401){
        console.log(error)
      }
    }
  }

  async function handleEdit(itemId) {}
  async function handleCreate() {}

  return (
    <div>
      <h1>Items</h1>
      <Table striped bordered hover>
        <thead>
          {(userRole === 'SuperAdmin' || userRole === 'BasicUser') && (
            <tr>
            <th> 
              <button onClick={() => setShowCreateModal(true)}>Create New Item</button>
            </th>
          </tr>
          )}
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Owner</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {console.log(items, typeof(items))}
          {items.map((item) => (
            <tr key={item.id}> 
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.user_email}</td>
                <td>{item.create_date}</td>
                {userRole === 'SuperAdmin' && (
                <div>
                    <button onClick={() => handleEdit(item.id)}>Edit</button>
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
                )}
                {userRole === 'Admin' && (
                <div>
                    <button onClick={() => handleEdit(item.id)}>Edit</button>
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
                )}
                {userRole === 'BasicUser' && (
                <div>
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
                )} 
            </tr>
          ))}
        </tbody>
      </Table>
      <CreateItemModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        token={token}
      />
    </div>
  );
}

export default Items