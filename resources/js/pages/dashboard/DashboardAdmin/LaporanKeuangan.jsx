import React from "react";

const LaporanKeuangan = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Laporan Keuangan</h1>
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
          />
        </svg>
        <p className="text-lg text-gray-600">Halaman Laporan Keuangan sedang dalam pengembangan</p>
        <p className="text-sm text-gray-500 mt-2">Fitur ini akan tersedia pada pembaruan mendatang</p>
      </div>
    </div>
  );
};

export default LaporanKeuangan;
