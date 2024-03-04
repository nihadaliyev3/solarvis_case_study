// ItemsComponent.js
import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import CreateItemModal from './CreateItemModal'; 
import UpdateItemModal from './UpdateItemModal';
import API_BASE_URL from '../config';
import axios from 'axios';

const UsersTable = ({ userRole }) => {
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const token = localStorage.getItem('jwtToken');
  const isAdmin = (userRole === 'SuperAdmin' || userRole === 'Admin')
  
  useEffect(() => {
    if (!token){
      return;
    }
    const fetchUsers = async () => {
      let data=[];
      try{
        const response = await axios.get(`${API_BASE_URL}/users/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (typeof(response.data)==='object'){
          console.log("response", response);
          data = response.data;
        }
        else{
          console.log(response);
        }
      }
      catch (error){
        console.log(error);
      }
      setUsers(data); 
    };

    fetchUsers();
  }, [refreshTrigger]); 


  async function handleDelete(userId) {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.delete(`${API_BASE_URL}/users/delete/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log("Successfully deleted!")
      setUsers(users.filter(user => user.id !== userId));  
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.response && error.response.status === 401){
        console.log(error)
      }
    }
  }

  async function handleSuspend(userId, isSuspend) {
    try {
      const token = localStorage.getItem('jwtToken');
      console.log(token);
      const response = await axios.put(`${API_BASE_URL}/users/suspend/${userId}`, {
        is_suspended:isSuspend,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log("Successfully suspended!");
      setRefreshTrigger(!refreshTrigger);
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  }

  return (
    <div>
      <h1>Users</h1>
      <Table striped bordered hover>
        <thead>
          {userRole === 'SuperAdmin' && (
            <tr>
            <th> 
              <button onClick={() => setShowCreateModal(true)}>Add User</button>
            </th>
          </tr>
          )}
          <tr>
            <th>Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            { isAdmin && (<th>Suspension Status</th>)}
            { isAdmin && (<th>Suspended By</th>)}
          </tr>
        </thead>
        <tbody>
          {console.log(users, typeof(users))}
          {users.map((user) => (
            <tr key={user.id}> 
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                { isAdmin && (<td>{user.is_suspended}</td>)}
                { isAdmin && (<td>{user.suspended_by}</td>)}
                {(userRole === 'SuperAdmin' && user.role !== 'SuperAdmin') && (
                <div>
                    <button onClick={() => setShowUpdateModal(user)}>Edit</button>
                    <button onClick={() => handleDelete(user.id)}>Delete</button>
                    {(user.is_suspended === 'True') ? (<button onClick={() => handleSuspend(user.id, false)}>Bring</button>):
                    <button onClick={() => handleSuspend(user.id, true)}>Suspend</button>
                    }
                    
                </div>
                )}
                {(userRole === 'Admin' && user.role === 'BasicUser') && (
                <div>
                    <button onClick={() => setShowUpdateModal(user)}>Edit</button>
                    {(user.is_suspended === 'True') ? (<button onClick={() => handleSuspend(user.id, false)}>Bring</button>):
                    <button onClick={() => handleSuspend(user.id, true)}>Suspend</button>
                    }
                    
                </div>
                )}
                {(userRole === 'BasicUser' || (userRole === 'Admin' && user.role==='Admin')) && (
                <div>
                    <button onClick={() => setShowUpdateModal(user)}>Edit</button>
                </div>
                )} 
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default UsersTable