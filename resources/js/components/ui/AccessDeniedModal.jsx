import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faTimes, 
  faInfoCircle, 
  faTimesCircle 
} from '@fortawesome/free-solid-svg-icons';

const AccessDeniedModal = ({ 
  isOpen, 
  onClose, 
  title = 'Akses Ditolak', 
  message = 'Anda tidak memiliki izin untuk mengakses fitur ini.',
  icon = 'warning' // warning, info, error
}) => {
  if (!isOpen) return null;
  
  // Determine icon and colors based on type
  const getIconConfig = () => {
    switch (icon) {
      case 'info':
        return {
          icon: faInfoCircle,
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-500'
        };
      case 'error':
        return {
          icon: faTimesCircle,
          bgColor: 'bg-red-500',
          textColor: 'text-red-500'
        };
      case 'warning':
      default:
        return {
          icon: faExclamationTriangle,
          bgColor: 'bg-amber-500',
          textColor: 'text-amber-500'
        };
    }
  };
  
  const { icon: iconComponent, bgColor, textColor } = getIconConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className={`${bgColor} text-white px-6 py-4 flex justify-between items-center`}>
          <div className="flex items-center">
            <FontAwesomeIcon icon={iconComponent} className="text-xl mr-2" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            className={`px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors`}
            onClick={onClose}
          >
            Kembali
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessDeniedModal; 