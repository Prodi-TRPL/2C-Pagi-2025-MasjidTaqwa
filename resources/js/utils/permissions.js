/**
 * Fetches the user permissions from the server
 * @returns {Promise<Object>} User permissions
 */
export const getUserPermissions = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

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
    
    // Extract permission fields
    return {
      canDonate: userData.can_donate === true || userData.can_donate === 1,
      canViewHistory: userData.can_view_history === true || userData.can_view_history === 1,
      canViewNotification: userData.can_view_notification === true || userData.can_view_notification === 1
    };
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
    const response = await fetch('/api/donation-status');
    
    if (!response.ok) {
      throw new Error('Failed to check donation status');
    }
    
    const data = await response.json();
    
    // Enhanced response with additional details
    return {
      is_active: data.is_active,
      message: data.message,
      details: data.details || {
        end_date_reached: false,
        target_met: false,
        manually_disabled: false
      }
    };
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
  return permissions[permissionKey] === true;
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