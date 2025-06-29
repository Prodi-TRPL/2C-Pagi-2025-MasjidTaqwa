// Cache for permissions and donation status
let permissionsCache = null;
let permissionsCacheTime = 0;
let donationStatusCache = null;
let donationStatusCacheTime = 0;

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Fetches the user permissions from the server
 * @returns {Promise<Object>} User permissions
 */
export const getUserPermissions = async () => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (permissionsCache && (now - permissionsCacheTime < CACHE_EXPIRATION)) {
      console.log('Using cached permissions:', permissionsCache);
      return permissionsCache;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, returning null permissions');
      return null;
    }

    console.log('Fetching permissions from server...');
    const response = await fetch('/api/donatur/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user permissions');
    }

    const userData = await response.json();
    console.log('Raw user data from API:', userData);
    
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
    
    console.log('Processed permissions:', permissions);
    console.log('Permission types:', {
      canDonate: typeof permissions.canDonate,
      canViewHistory: typeof permissions.canViewHistory,
      canViewNotification: typeof permissions.canViewNotification
    });
    
    // Update cache
    permissionsCache = permissions;
    permissionsCacheTime = now;
    
    return permissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return null;
  }
};

/**
 * Checks the global donation status
 * @returns {Promise<Object>} Donation status and message
 */
export const checkGlobalDonationStatus = async () => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (donationStatusCache && (now - donationStatusCacheTime < CACHE_EXPIRATION)) {
      return donationStatusCache;
    }
    
    const response = await fetch('/api/donation-status');
    
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
    return {
      is_active: true, // Default to active if error
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
 * Fetches the detailed donation settings and statistics
 * @returns {Promise<Object>} Donation settings and status
 */
export const getDetailedDonationStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch('/api/donation-settings', {
      headers
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