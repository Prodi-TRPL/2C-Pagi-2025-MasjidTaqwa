import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserPermissions, hasPermission, getPermissionDeniedMessage } from '../../utils/permissions';
import AccessDeniedModal from './AccessDeniedModal';

/**
 * Route wrapper that checks if user has the required permission
 * @param {string} permissionKey - The permission key to check
 * @param {React.Component} component - The component to render if permitted
 * @param {string} redirectTo - Where to redirect if not permitted (optional)
 */
const PermissionRoute = ({ permissionKey, component: Component, redirectTo = "/" }) => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const userPermissions = await getUserPermissions();
        setPermissions(userPermissions);
        
        // If permission is denied, show modal
        if (!hasPermission(userPermissions, permissionKey)) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [permissionKey]);

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#59B997]"></div>
      </div>
    );
  }

  // Get the permission denied message
  const { title, message } = getPermissionDeniedMessage(permissionKey);

  // If user lacks the required permission
  if (!hasPermission(permissions, permissionKey)) {
    return (
      <>
        <AccessDeniedModal 
          isOpen={showModal} 
          onClose={() => {
            setShowModal(false);
            window.location.href = redirectTo;
          }}
          title={title}
          message={message}
        />
        <Navigate to={redirectTo} state={{ from: location }} replace />
      </>
    );
  }

  // User has permission, render the component
  return <Component />;
};

export default PermissionRoute; 