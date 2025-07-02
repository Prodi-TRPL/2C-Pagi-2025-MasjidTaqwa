import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ProyekPembangunan = () => {
  // All the same state variables and other code...
  
  // Remove tanggal_pengeluaran from the detailFormPengeluaran state
  const [detailFormPengeluaran, setDetailFormPengeluaran] = useState({
    pengeluaran_id: null,
    nama_pengeluaran: '',
    jumlah: '',
    keterangan: '',
    kategori_pengeluaran_id: '',
    // tanggal_pengeluaran removed
  });
  
  // The rest of your component code remains the same...
  
  // Function to clear the detail form (without tanggal_pengeluaran)
  const clearDetailForm = () => {
    setDetailFormPengeluaran({
      pengeluaran_id: null,
      nama_pengeluaran: '',
      jumlah: '',
      keterangan: '',
      kategori_pengeluaran_id: '',
      // tanggal_pengeluaran removed
    });
    setDisplayDetailJumlah('');
    
    // Ensure the default sort is by date (newest first)
    setExpenseSortOption('date-desc');
  };
  
  // Function to handle edit pengeluaran in detail modal (without tanggal_pengeluaran)
  const handleEditDetailPengeluaran = (p) => {
    setDetailFormPengeluaran({
      pengeluaran_id: p.pengeluaran_id,
      nama_pengeluaran: p.nama_pengeluaran,
      jumlah: p.jumlah?.toString() || '',
      keterangan: p.keterangan || '',
      kategori_pengeluaran_id: p.kategori_pengeluaran_id,
      // tanggal_pengeluaran removed
    });
    // Set formatted display value
    setDisplayDetailJumlah(formatCurrency(p.jumlah));
    setShowPengeluaranForm(true);
  };
  
  // In the render method, remove the DatePicker component in the form
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* All your component JSX remains the same, except for the DatePicker */}
      
      {/* Example of what to remove from the detail form: */}
      {/*
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Tanggal *</label>
        <DatePicker
          selected={detailFormPengeluaran.tanggal_pengeluaran}
          onChange={handleDetailDateChange} // This function no longer exists
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
          dateFormat="yyyy-MM-dd"
        />
      </div>
      */}
    </div>
  );
};

export default ProyekPembangunan; 