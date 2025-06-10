import React from "react";

const Notifikasi = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Notifikasi testing</h1>
      <div className="p-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-gray-400 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        <p className="text-lg text-gray-600">Halaman Notifikasi sedang dalam pengembangan</p>
        <p className="text-sm text-gray-500 mt-2">Fitur ini akan tersedia pada pembaruan mendatang</p>
      </div>
    </div>
  );
};

export default Notifikasi;
