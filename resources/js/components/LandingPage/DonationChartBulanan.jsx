import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
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
import { motion, AnimatePresence } from "framer-motion";

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

const DonationChartBulanan = () => {
  const [dataPoints, setDataPoints] = useState({ donasi: [], pengeluaran: [], saldo: [] });
  const [labels, setLabels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("bulanan");
  const modalRef = useRef();
  const [summary, setSummary] = useState({
    total_pemasukan: 0,
    total_pengeluaran: 0,
    total_saldo: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setSummary(response.data.summary);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat data. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const toggleModal = () => setShowModal(!showModal);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Donasi Masuk",
        data: dataPoints.donasi,
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
        data: dataPoints.pengeluaran,
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
        data: dataPoints.saldo,
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
  };

  const options = {
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
  };

  return (
    <motion.div 
      className="w-full max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
          <p className="text-xl font-bold text-green-600">{formatRupiah(summary.total_pemasukan)}</p>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-sm text-red-700 mb-1 font-medium">Total Pengeluaran</h3>
          <p className="text-xl font-bold text-red-600">{formatRupiah(summary.total_pengeluaran)}</p>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-sm text-blue-700 mb-1 font-medium">Total Saldo</h3>
          <p className={`text-xl font-bold ${summary.total_saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatRupiah(summary.total_saldo)}
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="h-64 flex items-center justify-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      ) : (
        <>
          <div className="h-80">
            <Line data={data} options={options} />
          </div>

          <div className="mt-4 text-center">
            <motion.button
              onClick={toggleModal}
              className="bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Detail Tabel
            </motion.button>
          </div>
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Detail Laporan Keuangan ({filter === 'harian' ? 'Harian' : filter === 'tahunan' ? 'Tahunan' : 'Bulanan'})
                </h3>
                <button
                  onClick={toggleModal}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-auto max-h-[70vh]">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        {filter === 'harian' ? 'Tanggal' : filter === 'tahunan' ? 'Tahun' : 'Bulan'}
                      </th>
                      <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Donasi Masuk
                      </th>
                      <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Pengeluaran
                      </th>
                      <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Saldo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {labels.map((period, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3 text-sm font-medium text-gray-900 border-b">
                          {period}
                        </td>
                        <td className="p-3 text-sm text-right text-green-600 font-medium border-b">
                          {formatRupiah(dataPoints.donasi[index])}
                        </td>
                        <td className="p-3 text-sm text-right text-red-600 font-medium border-b">
                          {formatRupiah(dataPoints.pengeluaran[index])}
                        </td>
                        <td className={`p-3 text-sm text-right font-medium border-b ${
                          dataPoints.saldo[index] >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {formatRupiah(dataPoints.saldo[index])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 sticky bottom-0">
                    <tr>
                      <td className="p-3 text-sm font-bold text-gray-900 border-t">
                        Total
                      </td>
                      <td className="p-3 text-sm text-right text-green-600 font-bold border-t">
                        {formatRupiah(summary.total_pemasukan)}
                      </td>
                      <td className="p-3 text-sm text-right text-red-600 font-bold border-t">
                        {formatRupiah(summary.total_pengeluaran)}
                      </td>
                      <td className={`p-3 text-sm text-right font-bold border-t ${
                        summary.total_saldo >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatRupiah(summary.total_saldo)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-4 text-right">
                <button
                  onClick={toggleModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DonationChartBulanan;
