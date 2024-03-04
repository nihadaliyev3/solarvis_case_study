import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({allowedRoles, WrappedComponent}) => { 
    const checkAuthentication = (inUseEffect) => { 
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            return <Navigate to="/signin" replace />; 
        } else {
            const decodedToken = jwtDecode(token);
            const userRole = decodedToken.role;

            if (!allowedRoles.includes(userRole)) {
                return <Navigate to="/unauthorized" replace />; // Or a suitable error page
            }

            console.log('offf');
            if (inUseEffect === false){
                console.log('zort');
                return <WrappedComponent userRole={userRole}/>; 
            }
        }         
    };

    useEffect(() => {
        checkAuthentication(true); // Call the function here
    }, []); 

    return checkAuthentication(false); // Call and return the result
};

export default ProtectedRoute;
