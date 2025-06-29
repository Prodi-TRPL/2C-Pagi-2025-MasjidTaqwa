import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { logoutUserWithMessage } from '../../utils/permissionChecker';

/**
 * Modal displayed when user permissions are revoked
 * This forces the user to log out
 */
const PermissionRevokedModal = ({ 
  isOpen,
  changedPermissions = null,
  message = 'Akses Anda telah dicabut oleh administrator. Anda akan dialihkan ke halaman login.'
}) => {
  const [countdown, setCountdown] = useState(3);
  const isDatabaseRevoked = changedPermissions?.databaseAccessRevoked === true;
  
  useEffect(() => {
    // Reset countdown when modal opens
    if (isOpen) {
      setCountdown(3);
    }
  }, [isOpen]);
  
  useEffect(() => {
    // Automatically log out after countdown
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (isOpen && countdown === 0) {
      handleLogout();
    }
  }, [isOpen, countdown]);
  
  // Handle logout button click
  const handleLogout = () => {
    const logoutMsg = isDatabaseRevoked
      ? 'Akses database Anda telah dicabut oleh administrator. Silakan login kembali.'
      : message;
    
    logoutUserWithMessage(logoutMsg);
  };
  
  // Generate message about which permissions were revoked
  const getDetailedMessage = () => {
    if (isDatabaseRevoked) {
      return (
        <div className="mt-2 text-sm text-red-600">
          <p>Administrator telah mencabut akses database Anda.</p>
          <p className="mt-1">Hal ini dapat terjadi karena:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Perubahan hak akses di MySQL/phpMyAdmin</li>
            <li>Akun database Anda telah dihapus</li>
            <li>Perubahan konfigurasi database</li>
          </ul>
        </div>
      );
    }
    
    if (!changedPermissions) return null;
    
    const revokedPermissions = [];
    if (changedPermissions.canDonate) revokedPermissions.push('Donasi');
    if (changedPermissions.canViewHistory) revokedPermissions.push('Riwayat Transaksi');
    if (changedPermissions.canViewNotification) revokedPermissions.push('Notifikasi');
    
    if (revokedPermissions.length === 0) return null;
    
    return (
      <div className="mt-2 text-sm text-red-600">
        <p>Hak akses yang dicabut:</p>
        <ul className="list-disc list-inside mt-1">
          {revokedPermissions.map((perm, index) => (
            <li key={index}>{perm}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-[99999] flex items-center justify-center">
      {/* Overlay - higher z-index to cover everything including sidebar */}
      <div className="fixed inset-0 bg-black opacity-80 transition-opacity"></div>
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FontAwesomeIcon 
              icon={isDatabaseRevoked ? faDatabase : faExclamationTriangle} 
              className="text-xl mr-2" 
            />
            <h3 className="text-lg font-semibold">
              {isDatabaseRevoked ? 'Akses Database Dicabut' : 'Hak Akses Dicabut'}
            </h3>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700">{isDatabaseRevoked 
            ? 'Akses database Anda telah dicabut oleh administrator. Anda akan dialihkan ke halaman login.' 
            : message}
          </p>
          {getDetailedMessage()}
          
          <div className="mt-4 text-sm text-gray-500">
            Anda akan dialihkan dalam <span className="font-bold text-red-600">{countdown}</span> detik...
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={handleLogout}
          >
            Logout Sekarang
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PermissionRevokedModal; 