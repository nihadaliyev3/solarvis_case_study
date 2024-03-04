import React from 'react';
import NavigationBar from './NavigationBar';
import { useLocation } from 'react-router-dom';

function Layout({ children, userRole }) {
    const location = useLocation(); 
    return (
        <div>
            {(location.pathname !== '/signin' && location.pathname !== '/signup') && (
            <NavigationBar userRole={userRole} /> )}
            <main>{children}</main>
        </div>
    );
}

export default Layout;
