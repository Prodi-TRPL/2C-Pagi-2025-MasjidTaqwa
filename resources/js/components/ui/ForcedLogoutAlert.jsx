import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faInfoCircle, faDatabase } from '@fortawesome/free-solid-svg-icons';

/**
 * Alert component displayed on login page when user was forcibly logged out
 * due to permission revocation
 */
const ForcedLogoutAlert = () => {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const [alertType, setAlertType] = useState('warning'); // warning, info, error
  
  useEffect(() => {
    // Check if there's a logout message in sessionStorage
    const logoutMessage = sessionStorage.getItem('logout_message');
    
    if (logoutMessage) {
      setMessage(logoutMessage);
      setShow(true);
      
      // Determine alert type based on message content
      if (logoutMessage.toLowerCase().includes('database')) {
        setAlertType('error');
      } else if (logoutMessage.toLowerCase().includes('akses')) {
        setAlertType('warning');
      } else {
        setAlertType('info');
      }
      
      // Clear the message from sessionStorage
      sessionStorage.removeItem('logout_message');
    }
  }, []);
  
  // If no message or not showing, don't render anything
  if (!show || !message) {
    return null;
  }
  
  // Determine icon and colors based on alert type
  const alertConfig = {
    warning: {
      icon: faExclamationTriangle,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-300',
      iconColor: 'text-amber-500'
    },
    info: {
      icon: faInfoCircle,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      iconColor: 'text-blue-500'
    },
    error: {
      icon: faDatabase,
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      iconColor: 'text-red-500'
    }
  };
  
  const { icon, bgColor, textColor, borderColor, iconColor } = alertConfig[alertType];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-6 p-4 rounded-lg border ${bgColor} ${borderColor} ${textColor} flex items-start`}
    >
      <div className="flex-shrink-0 mr-3">
        <FontAwesomeIcon icon={icon} className={`${iconColor} text-lg`} />
      </div>
      <div className="flex-grow">
        <p className="font-medium">{message}</p>
      </div>
      <button 
        className={`ml-4 ${textColor} hover:${textColor} focus:outline-none`}
        onClick={() => setShow(false)}
      >
        &times;
      </button>
    </motion.div>
  );
};

export default ForcedLogoutAlert; 