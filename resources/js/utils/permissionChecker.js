import axios from 'axios';

// Store the initial permissions when the user logs in
let initialPermissions = null;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 3; // Increased tolerance for network issues
let intervalId = null;
let isPaused = false; // Track if the checker is paused

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
  
  // Only consider permission revoked (false→true), not granted (true→false)
  // This prevents false alerts when permissions are actually being granted
  if (initialPermissions.canDonate === true && currentPermissions.canDonate === false) {
    changes.canDonate = true;
    changed = true;
  }
  
  if (initialPermissions.canViewHistory === true && currentPermissions.canViewHistory === false) {
    changes.canViewHistory = true;
    changed = true;
  }
  
  if (initialPermissions.canViewNotification === true && currentPermissions.canViewNotification === false) {
    changes.canViewNotification = true;
    changed = true;
  }
  
  // If permissions are being granted (not revoked), update the initial permissions
  if (
    (initialPermissions.canDonate === false && currentPermissions.canDonate === true) ||
    (initialPermissions.canViewHistory === false && currentPermissions.canViewHistory === true) ||
    (initialPermissions.canViewNotification === false && currentPermissions.canViewNotification === true)
  ) {
    // Update the base permissions to prevent future false positives
    initialPermissions = { ...currentPermissions };
  }
  
  return {
    changed,
    changes
  };
};

// Set up the permission checker to run at regular intervals
export const setupPermissionChecker = (onPermissionRevoked = null, intervalMs = 30000) => { // Reduced frequency
  // Function to check permissions
  const checkPermissions = async () => {
    // Skip check if paused
    if (isPaused) {
      console.log('Permission checker is paused, skipping check');
      return;
    }
    
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
        },
        // Add cache buster to prevent browser caching
        params: { _t: Date.now() }
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
        
        // Double-check to prevent false positives - wait and check again
        setTimeout(async () => {
          try {
            // Make a second API request to confirm the change
            const confirmResponse = await axios.get('/api/user/permissions', {
              headers: {
                Authorization: `Bearer ${token}`
              },
              params: { _t: Date.now() } // Cache buster
            });
            
            const confirmedPermissions = confirmResponse.data;
            const confirmedChanges = {};
            let confirmedChanged = false;
            
            // Verify each changed permission
            for (const key in changes) {
              if (
                initialPermissions[key] === true && 
                confirmedPermissions[key] === false
              ) {
                confirmedChanges[key] = true;
                confirmedChanged = true;
              }
            }
            
            // Only proceed if changes are confirmed
            if (confirmedChanged) {
              // Call the callback if provided
              if (typeof onPermissionRevoked === 'function') {
                handlePermissionRevoked(confirmedChanges, onPermissionRevoked);
              } else {
                // Default behavior: store revocation info and force logout
                handlePermissionRevoked(confirmedChanges);
              }
              
              // Stop checking after permissions have changed
              stop();
            } else {
              // Changes not confirmed, update initial permissions to prevent false positives
              initialPermissions = { ...confirmedPermissions };
              console.log('Permission changes were not confirmed in second check - false positive avoided');
            }
          } catch (error) {
            console.error('Error in confirmation check:', error);
          }
        }, 2000); // Wait 2 seconds before confirming
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
          // Double-check to prevent false positives
          setTimeout(async () => {
            try {
              await axios.get('/api/user/permissions', {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              // If successful, it was a temporary error
              consecutiveErrors = 0;
            } catch (error) {
              // If still failing, handle as database access revoked
              handleDatabaseAccessRevoked(onPermissionRevoked);
              stop();
            }
          }, 2000);
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
    isPaused = false;
    checkPermissions();
    
    // Then set up interval for regular checks
    if (!intervalId) {
      intervalId = setInterval(checkPermissions, intervalMs);
      console.log(`Permission checker started with interval of ${intervalMs}ms`);
    } else {
      console.warn('Permission checker already running');
    }
    
    // Make the controller available globally for components to access
    window.__permissionCheckerController = {
      stop,
      pause,
      resume,
      checkNow: checkPermissions
    };
    
    // Return methods to control the checker
    return window.__permissionCheckerController;
  };
  
  // Pause checking permissions temporarily
  const pause = () => {
    isPaused = true;
    console.log('Permission checker paused');
    return { resume };
  };
  
  // Resume checking permissions
  const resume = () => {
    isPaused = false;
    console.log('Permission checker resumed');
    return { pause };
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
    pause,
    resume,
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