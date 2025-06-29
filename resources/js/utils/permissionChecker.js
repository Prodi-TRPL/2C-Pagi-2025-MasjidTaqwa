import axios from 'axios';

// Store the initial permissions when the user logs in
let initialPermissions = null;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 2; // After this many consecutive errors, consider it a permission issue
let intervalId = null;

// Compare current permissions with initial permissions to detect changes
export const havePermissionsChanged = (currentPermissions) => {
  // If we don't have initial permissions yet, store them
  if (!initialPermissions) {
    initialPermissions = { ...currentPermissions };
    return {
      changed: false,
      changes: {}
    };
  }
  
  // Check for changes in permissions
  const changes = {};
  let changed = false;
  
  // Check each permission
  if (initialPermissions.canDonate && !currentPermissions.canDonate) {
    changes.canDonate = true;
    changed = true;
  }
  
  if (initialPermissions.canViewHistory && !currentPermissions.canViewHistory) {
    changes.canViewHistory = true;
    changed = true;
  }
  
  if (initialPermissions.canViewNotification && !currentPermissions.canViewNotification) {
    changes.canViewNotification = true;
    changed = true;
  }
  
  return {
    changed,
    changes
  };
};

// Set up the permission checker to run at regular intervals
export const setupPermissionChecker = (onPermissionRevoked = null, intervalMs = 10000) => {
  // Function to check permissions
  const checkPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // No token, no need to check permissions
        return;
      }
      
      // Make API request to get current permissions
      const response = await axios.get('/api/user/permissions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Reset consecutive errors counter on successful request
      consecutiveErrors = 0;
      
      // Get current permissions from response
      const currentPermissions = response.data;
      
      // Check if permissions have changed
      const { changed, changes } = havePermissionsChanged(currentPermissions);
      
      // If permissions have changed, handle it
      if (changed) {
        console.log('Permissions have changed:', changes);
        
        // Call the callback if provided
        if (typeof onPermissionRevoked === 'function') {
          handlePermissionRevoked(changes, onPermissionRevoked);
        } else {
          // Default behavior: store revocation info and force logout
          handlePermissionRevoked(changes);
        }
        
        // Stop checking after permissions have changed
        stop();
      }
      
    } catch (error) {
      console.error('Error checking permissions:', error);
      
      // Check if this is a database access error (401 with specific message)
      if (error.response && error.response.status === 401) {
        const errorMessage = error.response.data?.message || '';
        const isDatabaseError = errorMessage.toLowerCase().includes('database') || 
                               errorMessage.toLowerCase().includes('db') ||
                               errorMessage.toLowerCase().includes('access denied');
        
        if (isDatabaseError) {
          // Database access has been revoked
          handleDatabaseAccessRevoked(onPermissionRevoked);
          stop();
          return;
        }
      }
      
      // Count consecutive errors
      consecutiveErrors++;
      
      // If we've had too many consecutive errors, treat it as a permission issue
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.warn(`${consecutiveErrors} consecutive errors checking permissions - treating as permission revoked`);
        handleDatabaseAccessRevoked(onPermissionRevoked);
        stop();
      }
    }
  };
  
  // Handle database access revocation
  const handleDatabaseAccessRevoked = (callback) => {
    // Create a changes object with a special flag for database access revoked
    const changes = {
      databaseAccessRevoked: true
    };
    
    // Call the callback if provided
    if (typeof callback === 'function') {
      callback(changes);
    } else {
      // Default behavior: store info and force logout
      logoutUserWithMessage('Akses database telah dicabut. Silahkan hubungi administrator.');
    }
  };
  
  // Handle permission revocation
  const handlePermissionRevoked = (changedPermissions, callback) => {
    // Call the callback if provided
    if (typeof callback === 'function') {
      callback(changedPermissions);
    } else {
      // Default behavior: store info and force logout
      logoutUserWithMessage('Hak akses Anda telah diubah oleh administrator.');
    }
  };
  
  // Start checking permissions
  const start = () => {
    // First check immediately
    console.log('Permission checker starting - checking permissions immediately');
    checkPermissions();
    
    // Then set up interval for regular checks
    if (!intervalId) {
      intervalId = setInterval(checkPermissions, intervalMs);
      console.log(`Permission checker started with interval of ${intervalMs}ms`);
    } else {
      console.warn('Permission checker already running');
    }
    
    // Return methods to control the checker
    return {
      stop,
      checkNow: checkPermissions
    };
  };
  
  // Stop checking permissions
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('Permission checker stopped');
    }
  };
  
  // Return control methods
  return {
    start,
    stop,
    checkNow: checkPermissions
  };
};

// Function to log out the user with a specific message
export const logoutUserWithMessage = (message) => {
  // Store the message in session storage to display after redirect
  if (message) {
    sessionStorage.setItem('logout_message', message);
  }
  
  // Clear user data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect to login page (fixed path to match the application's route)
  window.location.href = '/loginbaru';
}; 