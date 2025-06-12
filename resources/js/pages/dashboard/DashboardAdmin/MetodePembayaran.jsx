import React from "react";

const MetodePembayaran = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Metode Pembayaran</h1>
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
          />
        </svg>
        <p className="text-lg text-gray-600">Halaman Metode Pembayaran sedang dalam pengembangan</p>
        <p className="text-sm text-gray-500 mt-2">Fitur ini akan tersedia pada pembaruan mendatang</p>
      </div>
    </div>
  );
};

export default MetodePembayaran;
