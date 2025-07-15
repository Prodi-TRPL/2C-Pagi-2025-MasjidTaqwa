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
  faFilePdf,
  faInfoCircle,
  faSearch,
  faClock,
  faAngleLeft,
  faAngleRight
} from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Date range filter
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  // Transaction type filter
  const [transactionType, setTransactionType] = useState("semua"); // "semua", "pemasukan", "pengeluaran"

  // Filter options
  const filterOptions = [
    { value: "harian", label: "Harian" },
    { value: "bulanan", label: "Bulanan" },
    { value: "tahunan", label: "Tahunan" },
  ];

  // Transaction type options
  const transactionTypeOptions = [
    { value: "semua", label: "Semua" },
    { value: "pemasukan", label: "Pemasukan" },
    { value: "pengeluaran", label: "Pengeluaran" },
  ];

  // Data limit options
  const limitOptions = [10, 20, 50, 100];

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

  // Format number without currency symbol (used for PDF export)
  const formatNumberNoCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const fetchReports = async (selectedFilter) => {
    try {
      setLoading(true);
      let params = { filter: selectedFilter };
      
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
      // Reset to page 1 whenever we fetch new data
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(filter);
  }, [filter]);
  
  useEffect(() => {
    applyFilters(reports);
  }, [searchTerm, reports]);

  useEffect(() => {
    applyTransactionFilters(transactions);
  }, [searchTerm, transactionType, dateRange.startDate, dateRange.endDate, transactions]);

  // Reset to page 1 when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

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

  // Apply filters to transactions
  const applyTransactionFilters = (data) => {
    let filtered = [...data];
    
    // Apply date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.tanggal);
        return transactionDate >= dateRange.startDate && 
               transactionDate <= new Date(dateRange.endDate.setHours(23, 59, 59, 999));
      });
    }
    
    // Apply transaction type filter
    if (transactionType !== "semua") {
      filtered = filtered.filter(transaction => transaction.tipe === transactionType);
    }
    
    // Apply search term filter (for description/keterangan)
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tanggal_formatted.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTransactions(filtered);
    // Reset to page 1 when filters change
    setCurrentPage(1);
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

  // Export to PDF
  const exportToPDF = (data, filename = 'laporan_keuangan') => {
    setExportLoading(true);
    
    // Use setTimeout to allow the UI to update with loading state
    setTimeout(() => {
      try {
        // Create PDF document with landscape orientation
        const doc = new jsPDF('l', 'mm', 'a4');
        
        // Set font styles
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        
        // Format period based on filter
        let periodText = '';
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
        
        // Add date range to period text if available
        if (dateRange.startDate && dateRange.endDate) {
          periodText += ` (${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)})`;
        }
        
        // Add title and header
        doc.text('MASJID TAQWA', 14, 15);
        doc.text('BUKU KAS', 240, 15, { align: 'right' });
        
        doc.setFontSize(12);
        doc.text(`Periode: ${periodText}`, 14, 22);
        
        // Add filter information
        if (transactionType !== "semua") {
          const typeText = transactionType === "pemasukan" ? "Pemasukan" : "Pengeluaran";
          doc.text(`Jenis Transaksi: ${typeText}`, 14, 28);
        }
        
        // Add summary section
        const yPos = transactionType !== "semua" ? 34 : 28;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Pemasukan: ${formatCurrency(summary.total_pemasukan)}`, 14, yPos);
        doc.text(`Total Pengeluaran: ${formatCurrency(summary.total_pengeluaran)}`, 14, yPos + 6);
        doc.text(`Saldo Akhir: ${formatCurrency(summary.total_saldo)}`, 14, yPos + 12);
        
        // Draw horizontal line
        doc.setLineWidth(0.5);
        doc.line(14, yPos + 15, 280, yPos + 15);
        
        // Sort transactions by date (oldest first for calculation)
        const sortedTransactions = [...filteredTransactions].sort((a, b) => a.tanggal - b.tanggal);
        
        // Calculate initial balance
        const totalIncome = sortedTransactions
          .filter(t => t.tipe === "pemasukan")
          .reduce((sum, t) => sum + parseFloat(t.jumlah || 0), 0);
        
        const totalExpense = sortedTransactions
          .filter(t => t.tipe === "pengeluaran")
          .reduce((sum, t) => sum + parseFloat(t.jumlah || 0), 0);
        
        // Initial balance is the final balance minus all incomes plus all expenses
        let runningBalance = summary.total_saldo - totalIncome + totalExpense;
        
        // Prepare table data with running balance
        const tableData = [];
        
        // Add each transaction with updated running balance
        sortedTransactions.forEach(transaction => {
          // Format date
          const date = new Date(transaction.tanggal);
          const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          
          // Get transaction amount as number
          const amount = parseFloat(transaction.jumlah || 0);
          
          // Update running balance based on transaction type
          if (transaction.tipe === "pemasukan") {
            runningBalance += amount;
            tableData.push([
              formattedDate,
              transaction.keterangan,
              `+${formatNumberNoCurrency(amount)}`,
              formatNumberNoCurrency(runningBalance)
            ]);
          } else {
            runningBalance -= amount;
            tableData.push([
              formattedDate,
              transaction.keterangan,
              `-${formatNumberNoCurrency(amount)}`,
              formatNumberNoCurrency(runningBalance)
            ]);
          }
        });
        
        // Add table to PDF
        doc.autoTable({
          startY: yPos + 20,
          head: [['Tanggal & Waktu', 'Keterangan', 'Nominal', 'Saldo']],
          body: tableData,
          headStyles: {
            fillColor: [89, 185, 151], // #59B997
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 40 }, // Date & Time
            1: { cellWidth: 120 }, // Description
            2: { cellWidth: 40, halign: 'right' }, // Amount
            3: { cellWidth: 40, halign: 'right' } // Balance
          },
          alternateRowStyles: {
            fillColor: [240, 248, 245] // Light green tint for alternate rows
          },
          bodyStyles: {
            lineWidth: 0.1,
            lineColor: [200, 200, 200]
          },
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 10
          },
          didDrawPage: function (data) {
            // Add page number at the bottom
            doc.setFontSize(8);
            doc.text(
              `Halaman ${doc.internal.getNumberOfPages()}`,
              data.settings.margin.left,
              doc.internal.pageSize.height - 10
            );
            
            // Add footer with date
            doc.text(
              `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
              doc.internal.pageSize.width - data.settings.margin.right,
              doc.internal.pageSize.height - 10,
              { align: 'right' }
            );
          }
        });
        
        // Save the PDF
        const typeText = transactionType !== "semua" ? `_${transactionType}` : '';
        doc.save(`buku_kas_${filter}${typeText}_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error("Error exporting to PDF:", error);
      } finally {
        setExportLoading(false);
      }
    }, 100); // Small delay to allow UI update
  };

  // Handle date range changes
  const handleStartDateChange = (date) => {
    setDateRange(prev => ({ ...prev, startDate: date }));
  };
  
  const handleEndDateChange = (date) => {
    setDateRange(prev => ({ ...prev, endDate: date }));
  };

  // Handle transaction type change
  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({
      startDate: null,
      endDate: null
    });
    setTransactionType('semua');
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Render summary cards
  const renderSummary = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Pemasukan</h3>
          <p className="text-2xl font-bold" >
            {formatCurrency(summary.total_pemasukan)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Pengeluaran</h3>
          <p className="text-2xl font-bold" >
            {formatCurrency(summary.total_pengeluaran)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-l-4" style={{ borderColor: "#59B997" }}>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Saldo Akhir</h3>
          <p className="text-2xl font-bold" >
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
    const sortedTransactions = [...currentItems].sort((a, b) => b.tanggal - a.tanggal);
    
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

  // Render pagination controls
  const renderPagination = () => {
    if (filteredTransactions.length <= itemsPerPage) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-md">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredTransactions.length)}
              </span>{" "}
              of <span className="font-medium">{filteredTransactions.length}</span> results
            </p>
          </div>
          
          <div className="flex items-center">
            <div className="mr-4">
              <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">Show:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {limitOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
                  currentPage === 1 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                <span className="sr-only">Previous</span>
                <FontAwesomeIcon icon={faAngleLeft} className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                // Logic to show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (currentPage <= 3) {
                  pageNum = idx + 1;
                  if (idx === 4) pageNum = totalPages;
                  if (idx === 3 && totalPages > 5) pageNum = "...";
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = currentPage - 2 + idx;
                  if (idx === 0) pageNum = 1;
                  if (idx === 1 && currentPage > 3) pageNum = "...";
                  if (idx === 4 && currentPage < totalPages - 2) pageNum = "...";
                  if (idx === 4 && currentPage < totalPages - 1) pageNum = totalPages;
                }

                return (
                  <button
                    key={idx}
                    onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                    className={`relative z-10 inline-flex items-center px-4 py-2 text-sm focus:z-20 
                      ${typeof pageNum !== 'number' 
                        ? 'text-gray-700 pointer-events-none'
                        : currentPage === pageNum
                          ? 'bg-[#59B997] border-[#59B997] text-white border'
                          : 'text-gray-900 hover:bg-gray-50 border-gray-300 border'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
                  currentPage === totalPages 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                <span className="sr-only">Next</span>
                <FontAwesomeIcon icon={faAngleRight} className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          <FontAwesomeIcon icon={faChartLine} className="mr-2 text-[#59B997]" />
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
                    ? "bg-[#59B997] text-white"
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
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-[#59B997] focus:border-[#59B997]"
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

          {/* Transaction Type Filter */}
          <div className="flex space-x-2">
            {transactionTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTransactionTypeChange(option.value)}
                className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
                  transactionType === option.value
                    ? "bg-[#59B997] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filter and PDF Export Buttons */}
        <div className="mb-6 flex items-center space-x-2">
          <button 
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            onClick={clearFilters}
          >
            Reset Filter
          </button>
          
          {/* PDF Export Button */}
          <button
            className="px-4 py-2 flex items-center justify-center text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
            onClick={() => exportToPDF(filteredTransactions)}
            disabled={exportLoading || loading || filteredTransactions.length === 0}
          >
            {exportLoading ? (
              <span className="inline-block animate-spin mr-2">&#9696;</span>
            ) : (
              <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
            )}
            Export PDF
          </button>
        </div>
        
        {/* Transaction Table */}
        {renderTransactionsTable()}
        
        {/* Pagination Controls */}
        {renderPagination()}
          </div>
    </div>
  );
};

export default LaporanKeuangan;
