// Cache for permissions and donation status
let permissionsCache = null;
let permissionsCacheTime = 0;
let donationStatusCache = null;
let donationStatusCacheTime = 0;
let permissionsFetchInProgress = false;

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Flag to track if we're forcing a refresh
let forceRefresh = false;

/**
 * Fetches the user permissions from the server
 * @param {boolean} ignoreCache - If true, bypasses the cache
 * @returns {Promise<Object>} User permissions
 */
export const getUserPermissions = async (ignoreCache = false) => {
  try {
    // Prevent multiple concurrent requests for permissions
    if (permissionsFetchInProgress) {
      // Wait for the existing request to finish if already in progress
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!permissionsFetchInProgress) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
      
      // If a request just completed, return the cache
      if (permissionsCache && !ignoreCache) {
        return permissionsCache;
      }
    }
    
    // Check if we have a valid cache and aren't forcing a refresh
    const now = Date.now();
    if (permissionsCache && (now - permissionsCacheTime < CACHE_EXPIRATION) && !ignoreCache && !forceRefresh) {
      return permissionsCache;
    }
    
    // Reset force refresh flag
    forceRefresh = false;
    
    // Mark fetch as in progress
    permissionsFetchInProgress = true;
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, returning null permissions');
      permissionsFetchInProgress = false;
      return null;
    }

    console.log('Fetching permissions from server...');
    const response = await fetch('/api/donatur/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Add cache buster
      cache: 'no-store'
    });

    if (!response.ok) {
      // Don't throw error for 401 as it's handled by auth system
      if (response.status !== 401) {
        throw new Error(`Failed to fetch user permissions: ${response.status}`);
      }
      permissionsFetchInProgress = false;
      return null;
    }

    const userData = await response.json();
    
    // Helper function to convert various truthy values to boolean
    const toBool = (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value === 1;
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        return lower === '1' || lower === 'true' || lower === 'yes';
      }
      return Boolean(value);
    };
    
    // Extract and explicitly cast permission fields to boolean
    const permissions = {
      canDonate: toBool(userData.can_donate),
      canViewHistory: toBool(userData.can_view_history),
      canViewNotification: toBool(userData.can_view_notification)
    };
    
    // If any permission value is undefined or null, use previous value to prevent false negatives
    if (permissionsCache) {
      if (permissions.canDonate === null || permissions.canDonate === undefined) {
        permissions.canDonate = permissionsCache.canDonate;
      }
      if (permissions.canViewHistory === null || permissions.canViewHistory === undefined) {
        permissions.canViewHistory = permissionsCache.canViewHistory;
      }
      if (permissions.canViewNotification === null || permissions.canViewNotification === undefined) {
        permissions.canViewNotification = permissionsCache.canViewNotification;
      }
    }
    
    // Update cache
    permissionsCache = permissions;
    permissionsCacheTime = now;
    
    // Mark fetch as complete
    permissionsFetchInProgress = false;
    
    return permissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    // Return the cached values on error to prevent false permission revocation
    permissionsFetchInProgress = false;
    return permissionsCache || null;
  }
};

/**
 * Checks the global donation status
 * @param {boolean} ignoreCache - If true, bypasses the cache
 * @returns {Promise<Object>} Donation status and message
 */
export const checkGlobalDonationStatus = async (ignoreCache = false) => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (donationStatusCache && (now - donationStatusCacheTime < CACHE_EXPIRATION) && !ignoreCache) {
      return donationStatusCache;
    }
    
    const response = await fetch('/api/donation-status', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to check donation status');
    }
    
    const data = await response.json();
    
    // Enhanced response with additional details
    const status = {
      is_active: data.is_active,
      message: data.message,
      details: data.details || {
        end_date_reached: false,
        target_met: false,
        manually_disabled: false
      }
    };
    
    // Update cache
    donationStatusCache = status;
    donationStatusCacheTime = now;
    
    return status;
  } catch (error) {
    console.error('Error checking donation status:', error);
    // Return cached value on error, or default to active if no cache
    return donationStatusCache || {
      is_active: true,
      message: null,
      details: {
        end_date_reached: false,
        target_met: false,
        manually_disabled: false
      }
    };
  }
};

/**
 * Force refresh of permissions data on next request
 */
export const invalidatePermissionsCache = () => {
  forceRefresh = true;
};

/**
 * Fetches the detailed donation settings and statistics
 * @returns {Promise<Object>} Donation settings and status
 */
export const getDetailedDonationStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { 
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    } : {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    const response = await fetch('/api/donation-settings', {
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch donation settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching donation settings:', error);
    return {
      settings: {
        is_donation_active: true,
        donation_end_date: null,
        donation_target: null,
        message_type: 'warning',
        denial_message: 'Donasi saat ini tidak tersedia. Silakan coba lagi nanti.'
      },
      donation_status: {
        is_active: true,
        total_donations: 0,
        progress_percentage: 0
      }
    };
  }
};

/**
 * Check if the user has the specified permission
 * @param {Object} permissions - The user's permissions object
 * @param {string} permissionKey - The permission key to check
 * @returns {boolean} - Whether the user has the permission
 */
export const hasPermission = (permissions, permissionKey) => {
  if (!permissions) return false;
  
  const permValue = permissions[permissionKey];
  
  // Handle different value types
  if (typeof permValue === 'boolean') return permValue;
  if (typeof permValue === 'number') return permValue === 1;
  if (typeof permValue === 'string') {
    const lower = permValue.toLowerCase();
    return lower === '1' || lower === 'true' || lower === 'yes';
  }
  
  // If permission is undefined, return true to prevent false negatives
  if (permValue === undefined || permValue === null) {
    console.warn(`Permission ${permissionKey} is undefined/null, returning true to prevent false negative`);
    return true;
  }
  
  return Boolean(permValue);
};

/**
 * Get permission message based on the denied permission
 * @param {string} permissionKey - The permission key
 * @returns {Object} - The title and message for the denied permission
 */
export const getPermissionDeniedMessage = (permissionKey) => {
  switch (permissionKey) {
    case 'canDonate':
      return {
        title: 'Donasi Tidak Diizinkan',
        message: 'Akun Anda saat ini tidak diizinkan untuk melakukan donasi. Silakan hubungi admin untuk informasi lebih lanjut.'
      };
    case 'canViewHistory':
      return {
        title: 'Akses Riwayat Ditolak',
        message: 'Akun Anda tidak memiliki izin untuk melihat riwayat transaksi. Silakan hubungi admin jika Anda memerlukan akses.'
      };
    case 'canViewNotification':
      return {
        title: 'Akses Notifikasi Ditolak',
        message: 'Akun Anda tidak memiliki izin untuk melihat notifikasi. Silakan hubungi admin untuk mengaktifkan fitur ini.'
      };
    case 'globalDonationDisabled':
      return {
        title: 'Donasi Saat Ini Tidak Tersedia',
        message: 'Sistem donasi sedang tidak aktif. Silakan coba lagi nanti.'
      };
    default:
      return {
        title: 'Akses Ditolak',
        message: 'Anda tidak memiliki izin untuk mengakses fitur ini. Silakan hubungi admin.'
      };
  }
}; 