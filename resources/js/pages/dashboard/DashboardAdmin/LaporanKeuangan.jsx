import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTable,
  faCalendarAlt,
  faMoneyBillWave,
  faHandHoldingUsd,
  faExchangeAlt,
  faChartLine,
  faFilter,
  faFileExcel,
  faInfoCircle,
  faSearch,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";

const LaporanKeuangan = () => {
  const [reports, setReports] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [filter, setFilter] = useState("bulanan"); // Default filter: bulanan
  const [summary, setSummary] = useState({
    total_pemasukan: 0,
    total_pengeluaran: 0,
    total_saldo: 0,
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  // Filter options
  const filterOptions = [
    { value: "harian", label: "Harian" },
    { value: "bulanan", label: "Bulanan" },
    { value: "tahunan", label: "Tahunan" },
  ];

  // Helper functions for formatting
  // Format date for API requests
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date with time
  const formatDateWithTime = (date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' WIB';
  };
  
  // Format currency to Indonesian Rupiah
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format number without currency symbol for Excel
  const formatNumberNoCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const fetchReports = async (selectedFilter) => {
    try {
      setLoading(true);
      let params = { filter: selectedFilter };
      
      // Add date range if available
      if (dateRange.startDate && dateRange.endDate) {
        params.start_date = formatDateForAPI(dateRange.startDate);
        params.end_date = formatDateForAPI(dateRange.endDate);
      }
      
      const response = await axios.get(`/api/laporan-keuangan`, { params });
      setReports(response.data.data);
      setSummary(response.data.summary);
      applyFilters(response.data.data);

      // After fetching reports, get detailed transactions
      await fetchTransactions(params);
    } catch (error) {
      console.error("Error fetching laporan keuangan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (params) => {
    try {
      setTransactionsLoading(true);
      
      // Fetch both donations and expenses
      const [donationsRes, expensesRes] = await Promise.all([
        axios.get('/api/donations', { params }),
        axios.get('/api/Pengeluaran', { params })
      ]);
      
      // Process donations data
      const donations = donationsRes.data
        .filter(donation => donation.status === 'Diterima')
        .map(donation => ({
          id: donation.id,
          tanggal: new Date(donation.created_at),
          tanggal_formatted: formatDateWithTime(new Date(donation.created_at)),
          jumlah: parseFloat(donation.jumlah) || 0,
          keterangan: "Pemasukan",
          tipe: "pemasukan",
          donatur: donation.name || donation.pengguna?.nama || "Anonymous",
          metode: donation.payment_method_name || donation.payment_type || "Online"
        }));
      
      // Process expenses data
      const expenses = (expensesRes.data.data || expensesRes.data || [])
        .map(expense => ({
          id: expense.pengeluaran_id,
          tanggal: new Date(expense.created_at),
          tanggal_formatted: formatDateWithTime(new Date(expense.created_at)),
          jumlah: parseFloat(expense.jumlah) || 0,
          keterangan: expense.keterangan || expense.nama_pengeluaran || "Pengeluaran",
          tipe: "pengeluaran",
          kategori: expense.kategori?.nama_kategori || "-"
        }));
      
      // Combine and sort by date (newest first)
      const combined = [...donations, ...expenses].sort((a, b) => b.tanggal - a.tanggal);
      
      setTransactions(combined);
      applyTransactionFilters(combined);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(filter);
  }, [filter, dateRange.startDate, dateRange.endDate]);
  
  useEffect(() => {
    applyFilters(reports);
  }, [searchTerm, reports]);

  useEffect(() => {
    applyTransactionFilters(transactions);
  }, [searchTerm, transactions]);

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  // Apply search filter to reports
  const applyFilters = (data) => {
    if (!searchTerm) {
      setFilteredReports(data);
      return;
    }
    
    const filtered = data.filter(report => 
      report.periode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredReports(filtered);
  };

  // Apply search filter to transactions
  const applyTransactionFilters = (data) => {
    if (!searchTerm) {
      setFilteredTransactions(data);
      return;
    }
    
    const filtered = data.filter(transaction => 
      transaction.tanggal_formatted.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredTransactions(filtered);
  };

  // Get title based on filter
  const getFilterTitle = () => {
    switch (filter) {
      case "harian":
        return "Laporan Keuangan Harian";
      case "tahunan":
        return "Laporan Keuangan Tahunan";
      default:
        return "Laporan Keuangan Bulanan";
    }
  };

  // Get period column title based on filter
  const getPeriodColumnTitle = () => {
    switch (filter) {
      case "harian":
        return "Tanggal";
      case "tahunan":
        return "Tahun";
      default:
        return "Bulan";
    }
  };

  // Export to Excel - updated to match the image format
  const exportToExcel = (data, filename = 'laporan_keuangan') => {
    setExportLoading(true);
    
    try {
      // Prepare the workbook
      const workbook = XLSX.utils.book_new();
      
      // Format period based on filter
      let periodText = '';
      if (dateRange.startDate && dateRange.endDate) {
        periodText = `${formatDateForAPI(dateRange.startDate)} - ${formatDateForAPI(dateRange.endDate)}`;
      } else {
        switch (filter) {
          case 'harian':
            periodText = 'Harian';
            break;
          case 'bulanan':
            periodText = 'Bulanan';
            break;
          case 'tahunan':
            periodText = 'Tahunan';
            break;
        }
      }
      
      // Create header with mosque information instead of personal banking details
      const header = [
        ['MASJID TAQWA', '', '', 'LAPORAN KEUANGAN'],
        ['', '', '', `Periode: ${periodText}`],
        [''],
        ['Total Pemasukan', 'Total Pengeluaran', 'Saldo Akhir'],
        [`${formatNumberNoCurrency(summary.total_pemasukan)}`, `${formatNumberNoCurrency(summary.total_pengeluaran)}`, formatNumberNoCurrency(summary.total_saldo)],
        [''],
        ['Tanggal & Waktu', 'Rincian Transaksi', '', 'Nominal (IDR)', 'Saldo (IDR)']
      ];
      
      // Running balance calculation - start with total saldo
      let runningBalance = summary.total_saldo;
      
      // Sort transactions by date (oldest first)
      const sortedTransactions = [...filteredTransactions].sort((a, b) => a.tanggal - b.tanggal);
      
      // Add transaction rows
      const transactionRows = sortedTransactions.map(transaction => {
        // Format date parts
        const date = transaction.tanggal;
        const dayFormatted = date.getDate().toString().padStart(2, '0') + ' ' +
                             ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()] + ' ' +
                             date.getFullYear();
        const timeFormatted = date.getHours().toString().padStart(2, '0') + ':' + 
                              date.getMinutes().toString().padStart(2, '0') + ':' + 
                              date.getSeconds().toString().padStart(2, '0') + ' WIB';
        
        // Calculate running balance for this row
        if (transaction.tipe === "pengeluaran") {
          runningBalance += transaction.jumlah; // Add back the expense to get previous balance
        } else {
          runningBalance -= transaction.jumlah; // Subtract income to get previous balance
        }
        
        const amount = transaction.tipe === "pemasukan" ? 
          `+${formatNumberNoCurrency(transaction.jumlah)}` : 
          `-${formatNumberNoCurrency(transaction.jumlah)}`;
        
        // Calculate balance after this transaction
        const balanceAfter = transaction.tipe === "pemasukan" ? 
          runningBalance + transaction.jumlah : 
          runningBalance - transaction.jumlah;
        
        // Update running balance for next iteration
        runningBalance = balanceAfter;
        
        return [
          `${dayFormatted}\n${timeFormatted}`, // Date and time
          transaction.keterangan, // Transaction description
          '', // Empty column
          amount, // Amount with + or - sign
          formatNumberNoCurrency(balanceAfter) // Running balance
        ];
      });
      
      // Combine all rows
      const allRows = [...header, ...transactionRows];
      
      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(allRows);
      
      // Set column widths
      const colWidths = [
        { wch: 20 }, // Date & Time
        { wch: 40 }, // Transaction Details
        { wch: 10 }, // Empty
        { wch: 15 }, // Amount
        { wch: 15 }, // Balance
      ];
      
      worksheet['!cols'] = colWidths;
      
      // Merge cells for header
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // MASJID TAQWA
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Period row
      ];
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");
      
      // Save the workbook
      XLSX.writeFile(workbook, `${filename}_${filter}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // Handle date range changes
  const handleStartDateChange = (date) => {
    setDateRange(prev => ({ ...prev, startDate: date }));
  };
  
  const handleEndDateChange = (date) => {
    setDateRange(prev => ({ ...prev, endDate: date }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({
      startDate: null,
      endDate: null
    });
  };

  // Render summary cards
  const renderSummary = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Pemasukan</h3>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(summary.total_pemasukan)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Pengeluaran</h3>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(summary.total_pengeluaran)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Saldo Akhir</h3>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(summary.total_saldo)}
          </p>
        </div>
      </div>
    );
  };

  // Render transactions table
  const renderTransactionsTable = () => {
    // Calculate running balance
    let runningBalance = summary.total_saldo;
    
    // Sort transactions by date (newest first for display)
    const sortedTransactions = [...filteredTransactions].sort((a, b) => b.tanggal - a.tanggal);
    
    return (
      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tanggal & Waktu
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Keterangan
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nominal
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Saldo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTransactions.map((transaction, index) => {
              // Update running balance for this row
              if (index === 0) {
                // First transaction starts from the total saldo
                runningBalance = summary.total_saldo;
              } else {
                // For subsequent transactions, adjust the balance
                if (sortedTransactions[index - 1].tipe === "pemasukan") {
                  runningBalance -= sortedTransactions[index - 1].jumlah;
                } else {
                  runningBalance += sortedTransactions[index - 1].jumlah;
                }
              }
              
              return (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    <div className="font-medium">
                      {formatDate(transaction.tanggal)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(transaction.tanggal)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    {transaction.keterangan || (transaction.tipe === "pemasukan" ? "Donasi" : "Pengeluaran")}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium text-right ${
                    transaction.tipe === "pemasukan" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {transaction.tipe === "pemasukan" ? "+" : "-"}
                    {formatCurrency(transaction.jumlah)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right text-gray-900 dark:text-gray-300">
                    {formatCurrency(runningBalance)}
                  </td>
                </tr>
              );
            })}
            
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada transaksi dalam periode ini
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          <FontAwesomeIcon icon={faChartLine} className="mr-2 text-blue-600" />
          Laporan Keuangan
        </h1>
        <p className="text-gray-600">
          Lihat dan analisis ringkasan keuangan donasi dan pengeluaran masjid
          berdasarkan periode yang Anda pilih
        </p>
      </div>

      {/* Summary Cards */}
      {renderSummary()}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 md:mb-0">
            <FontAwesomeIcon icon={faTable} className="mr-2 text-blue-600" />
            {getFilterTitle()}
          </h2>

          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex items-center mb-3 md:mb-0 md:mr-4">
              <FontAwesomeIcon
                icon={faFilter}
                className="text-gray-500 mr-2"
              />
              <span className="text-sm text-gray-600">Filter:</span>
            </div>
            <div className="flex space-x-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    filter === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Additional filters and export */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Search Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Date Range Picker */}
          <div className="flex space-x-2">
            <DatePicker
              selected={dateRange.startDate}
              onChange={handleStartDateChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Tanggal mulai"
              dateFormat="dd/MM/yyyy"
              isClearable
            />
            <DatePicker
              selected={dateRange.endDate}
              onChange={handleEndDateChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Tanggal akhir"
              dateFormat="dd/MM/yyyy"
              isClearable
              minDate={dateRange.startDate}
            />
          </div>
          
          {/* Clear Filter Button */}
          <button
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            onClick={clearFilters}
          >
            Reset Filter
          </button>
          
          {/* Export Button */}
          <button
            className="px-4 py-2 flex items-center justify-center text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            onClick={() => exportToExcel(filteredReports)}
            disabled={exportLoading || loading || filteredReports.length === 0}
          >
            {exportLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <>
                <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                Export to Excel
              </>
            )}
          </button>
        </div>

        {/* Transaction Table */}
        {renderTransactionsTable()}
      </div>
    </div>
  );
};

export default LaporanKeuangan;
