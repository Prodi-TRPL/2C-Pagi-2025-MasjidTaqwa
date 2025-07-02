import React, { useState, useEffect } from 'react';

const FixProyekPembangunan = () => {
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const fixFile = async () => {
      try {
        // Read the original file
        const response = await fetch('/api/read-file?path=resources/js/pages/dashboard/DashboardAdmin/ProyekPembangunan.jsx');
        const content = await response.text();
        
        // Find and remove the DatePicker section
        const fixedContent = content.replace(
          /\s*<div className="space-y-1">\s*<label[^>]*>Tanggal \*<\/label>\s*<DatePicker\s*selected=\{detailFormPengeluaran\.tanggal_pengeluaran\}\s*onChange=\{handleDetailDateChange\}[^}]*\/>\s*<\/div>/g,
          ''
        );
        
        // Write the fixed file
        const writeResponse = await fetch('/api/write-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: 'resources/js/pages/dashboard/DashboardAdmin/ProyekPembangunan.jsx',
            content: fixedContent,
          }),
        });
        
        if (writeResponse.ok) {
          setIsFixed(true);
        }
      } catch (error) {
        console.error('Error fixing file:', error);
      }
    };
    
    fixFile();
  }, []);
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ProyekPembangunan File Fix</h1>
      {isFixed ? (
        <div className="text-green-600">
          The file has been fixed successfully! You can now refresh and use the original component.
        </div>
      ) : (
        <div className="text-yellow-600">
          Attempting to fix the file... Please wait.
        </div>
      )}
    </div>
  );
};

export default FixProyekPembangunan; 