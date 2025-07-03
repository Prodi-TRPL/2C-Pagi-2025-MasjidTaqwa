// resources/js/components/DonationTableDonatur.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Chart } from 'primereact/chart';
import { motion } from 'framer-motion';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  CategoryScale,
  Filler,
  Legend,
  Title,
} from "chart.js";

// Import PrimeReact styles
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

ChartJS.register(
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  CategoryScale,
  Filler,
  Legend,
  Title
);

const DonationTableDonatur = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [chartOptions, setChartOptions] = useState({});
  const [summary, setSummary] = useState({
    totalDonations: 0,
    uniqueDonors: 0,
    avgDonationAmount: 0,
    topDonation: 0,
    totalAmount: 0
  });
  const [dataPoints, setDataPoints] = useState({ donasi: [], pengeluaran: [], saldo: [] });
  const [labels, setLabels] = useState([]);
  const [filter, setFilter] = useState("bulanan");
  const [reportSummary, setReportSummary] = useState({
    total_pemasukan: 0,
    total_pengeluaran: 0,
    total_saldo: 0
  });

  // Function to fetch donations
  const fetchDonations = async () => {
    try {
      setLoading(true);
      
      // Get donations from the API
      const response = await axios.get('/api/donations');
      
      // Filter to only show 'Diterima' status
      const approvedDonations = response.data.filter(d => d.status === 'Diterima');
      
      // Map the data to ensure consistent format
      const mappedData = approvedDonations.map((donation, index) => ({
        no: index + 1, // Sequential numbering
        donatur: donation.name || donation.pengguna?.nama || 'Anonymous',
        tanggal: formatDateFromAPI(donation.created_at),
        jumlah: parseFloat(donation.jumlah) || 0,
        metode_pembayaran: donation.payment_method_name || donation.payment_type || 'Online',
        email: donation.email || donation.pengguna?.email || '',
        order_id: donation.order_id || '',
        raw_date: donation.created_at
      }));
      
      setDonations(mappedData);
      setFilteredDonations(mappedData);
      
      // Calculate summary statistics
      calculateSummary(mappedData);
      
      // Fetch financial report data for chart
      await fetchReportData();
      
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch financial report data (similar to DonationChartBulanan)
  const fetchReportData = async () => {
    try {
      const response = await axios.get(`/api/laporan-keuangan?filter=${filter}`);
      
      // Process the data
      const data = response.data.data;
      
      // Extract data for chart
      const periods = data.map(item => item.periode);
      const donasiData = data.map(item => item.total_pemasukan);
      const pengeluaranData = data.map(item => item.total_pengeluaran);
      const saldoData = data.map(item => item.saldo);
      
      // Reverse arrays to show oldest first
      const reversedPeriods = [...periods].reverse();
      const reversedDonasi = [...donasiData].reverse();
      const reversedPengeluaran = [...pengeluaranData].reverse();
      const reversedSaldo = [...saldoData].reverse();
      
      setLabels(reversedPeriods);
      setDataPoints({
        donasi: reversedDonasi,
        pengeluaran: reversedPengeluaran,
        saldo: reversedSaldo
      });
      setReportSummary(response.data.summary);
      
      // Also set this up for the chart component
      setChartData({
        labels: reversedPeriods,
        datasets: [
          {
            label: "Donasi Masuk",
            data: reversedDonasi,
            borderColor: "rgba(0, 200, 100, 1)",
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, "rgba(0, 255, 150, 0.4)");
              gradient.addColorStop(1, "rgba(0, 255, 150, 0.05)");
              return gradient;
            },
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
          },
          {
            label: "Pengeluaran",
            data: reversedPengeluaran,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, "rgba(255, 99, 132, 0.3)");
              gradient.addColorStop(1, "rgba(255, 99, 132, 0.05)");
              return gradient;
            },
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
          },
          {
            label: "Saldo",
            data: reversedSaldo,
            borderColor: "rgba(53, 162, 235, 1)",
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, "rgba(53, 162, 235, 0.3)");
              gradient.addColorStop(1, "rgba(53, 162, 235, 0.05)");
              return gradient;
            },
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            borderDash: [5, 5],
          }
        ],
      });
      
      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              boxWidth: 20,
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ": " +
                  context.parsed.y.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  });
              },
            },
          },
          title: {
            display: true,
            text: filter === 'harian' ? 'Laporan Keuangan Harian' : filter === 'tahunan' ? 'Laporan Keuangan Tahunan' : 'Laporan Keuangan Bulanan',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) =>
                value.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }),
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      });
      
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  // Helper function to format date from API
  const formatDateFromAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to calculate summary statistics
  const calculateSummary = (data) => {
    // Total donations count
    const totalDonations = data.length;
    
    // Total amount
    const totalAmount = data.reduce((sum, d) => sum + d.jumlah, 0);
    
    // Unique donors (by email)
    const uniqueDonorEmails = new Set(data
      .filter(d => d.email)
      .map(d => d.email.toLowerCase()));
    const uniqueDonors = uniqueDonorEmails.size;
    
    // Average donation amount
    const avgDonationAmount = totalDonations ? totalAmount / totalDonations : 0;
    
    // Top donation
    const topDonation = data.length ? 
      Math.max(...data.map(d => d.jumlah)) : 0;
      
    setSummary({
      totalDonations,
      uniqueDonors,
      avgDonationAmount,
      topDonation,
      totalAmount
    });
  };
  
  // Apply filters
  const applyFilters = () => {
    let filtered = [...donations];
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(donation => {
        const donationDate = new Date(donation.raw_date);
        donationDate.setHours(0, 0, 0, 0);
        return donationDate.getTime() === filterDate.getTime();
      });
    }
    
    // Apply global filter (search)
    if (globalFilter) {
      const lowerGlobalFilter = globalFilter.toLowerCase();
      filtered = filtered.filter(donation => 
        donation.donatur.toLowerCase().includes(lowerGlobalFilter) ||
        donation.metode_pembayaran.toLowerCase().includes(lowerGlobalFilter) ||
        donation.email.toLowerCase().includes(lowerGlobalFilter) ||
        donation.tanggal.toLowerCase().includes(lowerGlobalFilter) ||
        donation.jumlah.toString().includes(lowerGlobalFilter)
      );
    }
    
    // Update numbered indices
    filtered = filtered.map((item, index) => ({
      ...item,
      no: index + 1
    }));
    
    setFilteredDonations(filtered);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setGlobalFilter('');
    setDateFilter(null);
    
    // Reset numbering when clearing filters
    const resetNumbering = donations.map((item, index) => ({
      ...item,
      no: index + 1
    }));
    setFilteredDonations(resetNumbering);
  };

  // Handle filter change for chart
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchReportData();
  };

  // Format currency for display
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    fetchDonations();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [globalFilter, dateFilter, donations]);

  // Template for the jumlah/amount column
  const jumlahBodyTemplate = (rowData) => {
    return formatRupiah(rowData.jumlah);
  };
  
  // Template for row number
  const indexBodyTemplate = (rowData) => {
    return rowData.no;
  };

  // Header component with search and filters
  const renderHeader = () => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div className="relative w-full sm:w-auto mb-2 sm:mb-0">
          <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari..."
            className="pl-9 py-2 w-full sm:w-64 rounded-lg border border-gray-300"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Calendar
            value={dateFilter}
            onChange={(e) => setDateFilter(e.value)}
            dateFormat="dd/mm/yy"
            placeholder="Pilih Tanggal"
            className="w-full sm:w-40"
            showIcon
          />
          <Button
            label="Reset"
            icon="pi pi-refresh"
            severity="secondary"
            onClick={clearFilters}
            className="p-button-outlined"
          />
          <Button
            label="Lihat Grafik"
            icon="pi pi-chart-line"
            severity="info"
            onClick={() => setShowChart(true)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Daftar Donasi</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div 
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-sm text-blue-700 mb-1 font-medium">Jumlah Donasi</h3>
          <p className="text-xl font-bold text-blue-600">{summary.totalDonations}</p>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-sm text-green-700 mb-1 font-medium">Total Penerimaan</h3>
          <p className="text-xl font-bold text-green-600">{formatRupiah(summary.totalAmount)}</p>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-sm text-purple-700 mb-1 font-medium">Rata-rata Donasi</h3>
          <p className="text-xl font-bold text-purple-600">{formatRupiah(summary.avgDonationAmount)}</p>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-sm text-amber-700 mb-1 font-medium">Donasi Tertinggi</h3>
          <p className="text-xl font-bold text-amber-600">{formatRupiah(summary.topDonation)}</p>
        </motion.div>
      </div>
      
      <DataTable
        value={filteredDonations}
        loading={loading}
        header={renderHeader()}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
        stripedRows
        emptyMessage="Tidak ada data donasi."
        sortField="raw_date"
        sortOrder={-1}
        responsiveLayout="scroll"
        className="shadow-sm"
      >
        <Column field="no" header="No" body={indexBodyTemplate} style={{ width: '5%' }} />
        <Column field="donatur" header="Donatur" style={{ width: '20%' }} sortable />
        <Column field="tanggal" header="Tanggal & Waktu" style={{ width: '25%' }} sortable />
        <Column field="jumlah" header="Jumlah" body={jumlahBodyTemplate} style={{ width: '15%' }} sortable />
        <Column field="metode_pembayaran" header="Metode Pembayaran" style={{ width: '25%' }} sortable />
      </DataTable>
      
      {/* Loading indicator at the bottom of the page when loading */}
      {loading && (
        <div className="mt-4">
          <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
        </div>
      )}
      
      {/* Chart Dialog - Updated to match DonationChartBulanan.jsx */}
      <Dialog 
        visible={showChart} 
        onHide={() => setShowChart(false)}
        header="Analisis Donasi" 
        style={{ width: '80vw' }}
        breakpoints={{ '960px': '90vw', '640px': '100vw' }}
        maximizable
      >
        <div className="p-2">
          {/* Filter tabs */}
          <div className="mb-4 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => handleFilterChange("bulanan")}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  filter === "bulanan"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-200`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("tahunan")}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === "tahunan"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border-t border-b border-r border-gray-200`}
              >
                Tahunan
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("harian")}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  filter === "harian"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border-t border-b border-r border-gray-200`}
              >
                Harian
              </button>
            </div>
          </div>
        
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div 
              className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h3 className="text-sm text-green-700 mb-1 font-medium">Total Pemasukan</h3>
              <p className="text-xl font-bold text-green-600">{formatRupiah(reportSummary.total_pemasukan)}</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h3 className="text-sm text-red-700 mb-1 font-medium">Total Pengeluaran</h3>
              <p className="text-xl font-bold text-red-600">{formatRupiah(reportSummary.total_pengeluaran)}</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h3 className="text-sm text-blue-700 mb-1 font-medium">Total Saldo</h3>
              <p className={`text-xl font-bold ${reportSummary.total_saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatRupiah(reportSummary.total_saldo)}
              </p>
            </motion.div>
          </div>
          
          <div className="h-[50vh]">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          <Divider />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Tabel Donatur</h3>
            <div className="overflow-auto max-h-[30vh]">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      No
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Donatur
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Tanggal & Waktu
                    </th>
                    <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Jumlah
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Metode
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((donation, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-sm font-medium text-gray-900 border-b">
                        {donation.no}
                      </td>
                      <td className="p-3 text-sm text-gray-900 border-b">
                        {donation.donatur}
                      </td>
                      <td className="p-3 text-sm text-gray-900 border-b">
                        {donation.tanggal}
                      </td>
                      <td className="p-3 text-sm text-right font-medium text-green-600 border-b">
                        {formatRupiah(donation.jumlah)}
                      </td>
                      <td className="p-3 text-sm text-gray-900 border-b">
                        {donation.metode_pembayaran}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DonationTableDonatur;

