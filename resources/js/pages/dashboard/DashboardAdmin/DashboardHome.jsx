import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMosque, faMoneyBillWave, faHandHoldingDollar, faBuilding, 
  faChartLine, faArrowUp, faArrowDown, faTrophy, faCalendarAlt,
  faSync, faFilter
} from "@fortawesome/free-solid-svg-icons";
import WelcomeCard from "../../../components/ecommerce/WelcomeCard";
import MonthlyReportChart from "../../../components/ecommerce/MonthlyReportChart";
import { Spinner } from "@material-tailwind/react";

export default function DashboardHome() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalExpenses: 0,
    balance: 0,
    donorCount: 0,
    trends: {
      donations: 15.8, // percentage increase
      expenses: 8.2,
      balance: 20.5,
      donors: 12.3
    }
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [currentProject, setCurrentProject] = useState({
    name: "Pembangunan Masjid Taqwa Muhammadiyah",
    description: "Pembangunan utama struktur masjid fase 2",
    target: 500000000,
    current: 125000000,
    endDate: "2026-06-30",
    startDate: "2025-01-15",
    phases: [
      { name: "Pondasi", complete: 100 },
      { name: "Struktur", complete: 45 },
      { name: "Atap", complete: 10 },
      { name: "Interior", complete: 0 },
      { name: "Fasilitas", complete: 0 },
    ]
  });
  const [timeFilter, setTimeFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  
  // Format currency to Indonesian Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date to Indonesian format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Calculate days remaining
  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = Math.abs(end - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate progress percentage
  const calculateProgress = (current, target) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  // Handle refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    // In a real application, this would trigger a new API call with the filter
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // This API call is mocked for now, replace with actual endpoint when available
      // Since the API might not be fully implemented yet, using dummy data as fallback
      
      /* Uncomment when API is ready
      const response = await axios.get('/api/admin/dashboard-stats');
      setStats(response.data.stats);
      setRecentDonations(response.data.recentDonations);
      setRecentExpenses(response.data.recentExpenses);
      setCurrentProject(response.data.currentProject);
      */
      
      // Dummy data for demonstration
      setStats({
        totalDonations: 125000000,
        totalExpenses: 75000000,
        balance: 50000000,
        donorCount: 75,
        trends: {
          donations: 15.8,
          expenses: 8.2,
          balance: 20.5,
          donors: 12.3
        }
      });
      
      setRecentDonations([
        { id: 1, nama: "Ahmad Fadli", jumlah: 5000000, tanggal_donasi: "2025-06-15", metode: "Transfer Bank" },
        { id: 2, nama: "Siti Nurhaliza", jumlah: 2500000, tanggal_donasi: "2025-06-14", metode: "QRIS" },
        { id: 3, nama: "Budi Santoso", jumlah: 1000000, tanggal_donasi: "2025-06-12", metode: "E-Wallet" },
        { id: 4, nama: "Dewi Fortuna", jumlah: 3000000, tanggal_donasi: "2025-06-10", metode: "Transfer Bank" },
        { id: 5, nama: "Haji Mukhtar", jumlah: 10000000, tanggal_donasi: "2025-06-08", metode: "Transfer Bank" }
      ]);
      
      setRecentExpenses([
        { id: 1, nama_pengeluaran: "Pembelian Semen", jumlah: 15000000, tanggal_pengeluaran: "2025-06-14", kategori: "Material Bangunan" },
        { id: 2, nama_pengeluaran: "Upah Tukang", jumlah: 10000000, tanggal_pengeluaran: "2025-06-13", kategori: "Jasa" },
        { id: 3, nama_pengeluaran: "Besi Beton", jumlah: 7500000, tanggal_pengeluaran: "2025-06-10", kategori: "Material Bangunan" },
        { id: 4, nama_pengeluaran: "Biaya Konsultasi Arsitek", jumlah: 5000000, tanggal_pengeluaran: "2025-06-08", kategori: "Jasa" },
        { id: 5, nama_pengeluaran: "Keramik Lantai", jumlah: 12000000, tanggal_pengeluaran: "2025-06-05", kategori: "Material Bangunan" }
      ]);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name || "Admin");
    fetchDashboardData();
  }, []);

  // Stat card component with trend indicator
  const StatCard = ({ icon, title, value, trend = 0, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden`}
    >
      <div className={`h-1 ${color.replace('border-l-4', 'bg')}`}></div>
      <div className="p-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color.replace('border-l-4', 'bg').replace('-500', '-100')} mr-4`}>
            <FontAwesomeIcon icon={icon} className={color.replace('border-l-4', 'text').replace('-500', '-500')} size="lg" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm">{title}</h3>
            <p className="font-bold text-gray-800 text-xl">{value}</p>
          </div>
        </div>
        {trend !== 0 && (
          <div className="mt-2 flex items-center">
            <div className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              <FontAwesomeIcon icon={trend > 0 ? faArrowUp : faArrowDown} className="mr-1" />
              {Math.abs(trend)}%
            </div>
            <span className="text-xs text-gray-500 ml-1">dibanding bulan lalu</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Project progress component
  const ProjectProgress = ({ project }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Progress Pembangunan</h3>
        <span className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
          {calculateDaysRemaining(project.endDate)} hari tersisa
        </span>
      </div>
      
      <h4 className="font-medium text-gray-800">{project.name}</h4>
      <p className="text-sm text-gray-600 mb-4">{project.description}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">Target Dana: {formatRupiah(project.target)}</span>
          <span className="font-semibold">{calculateProgress(project.current, project.target)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            style={{ width: `${calculateProgress(project.current, project.target)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Terkumpul: {formatRupiah(project.current)}
        </p>
      </div>
      
      <div className="space-y-3">
        <h5 className="font-medium text-gray-700 text-sm">Tahapan Pembangunan:</h5>
        {project.phases.map((phase, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex justify-between text-sm mb-1">
              <span>{phase.name}</span>
              <span className="font-medium">{phase.complete}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${phase.complete === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${phase.complete}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  // Recent transaction component
  const TransactionItem = ({ name, amount, date, type, isExpense = false }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
      <div className="flex items-center">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${isExpense ? 'bg-red-100' : 'bg-green-100'}`}>
          <FontAwesomeIcon 
            icon={isExpense ? faMoneyBillWave : faHandHoldingDollar} 
            className={isExpense ? 'text-red-500' : 'text-green-500'} 
          />
        </div>
        <div>
          <p className="font-medium text-gray-800">{name}</p>
          <div className="flex items-center text-xs text-gray-500">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
            {date}
          </div>
        </div>
      </div>
      <div className={`font-medium ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
        {isExpense ? '-' : '+'}{formatRupiah(amount)}
      </div>
    </div>
  );

  // Loading skeletons
  const StatCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md h-[110px] animate-pulse">
      <div className="h-1 bg-gray-200"></div>
      <div className="p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-gray-200 mr-4 h-12 w-12"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="mt-2 flex items-center">
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );

  const TransactionSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Dashboard header with actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500">Ringkasan aktivitas keuangan Masjid Taqwa Muhammadiyah</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                <FontAwesomeIcon icon={faFilter} />
                {timeFilter === "all" ? "Semua Waktu" : timeFilter}
                <FontAwesomeIcon icon={faArrowDown} className="text-xs" />
              </button>

              {/* Filter dropdown would go here */}
            </div>
            
            <button 
              onClick={handleRefresh}
              className={`px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 ${refreshing ? "opacity-50" : ""}`}
              disabled={refreshing}
            >
              <FontAwesomeIcon icon={faSync} className={`${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Welcome Card */}
        <WelcomeCard userName={userName} />
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard 
                icon={faHandHoldingDollar} 
                title="Total Donasi" 
                value={formatRupiah(stats.totalDonations)} 
                trend={stats.trends.donations}
                color="border-l-4 border-green-500" 
              />
              <StatCard 
                icon={faMoneyBillWave} 
                title="Total Pengeluaran" 
                value={formatRupiah(stats.totalExpenses)} 
                trend={stats.trends.expenses}
                color="border-l-4 border-red-500" 
              />
              <StatCard 
                icon={faMosque} 
                title="Saldo" 
                value={formatRupiah(stats.balance)} 
                trend={stats.trends.balance}
                color="border-l-4 border-blue-500" 
              />
              <StatCard 
                icon={faBuilding} 
                title="Jumlah Donatur" 
                value={stats.donorCount} 
                trend={stats.trends.donors}
                color="border-l-4 border-amber-500" 
              />
            </>
          )}
        </div>

        {/* Project Progress & Monthly Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            {loading ? <TransactionSkeleton /> : <ProjectProgress project={currentProject} />}
          </div>
          <div className="lg:col-span-8">
            <MonthlyReportChart />
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Donations */}
          {loading ? (
            <TransactionSkeleton />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon icon={faHandHoldingDollar} className="mr-2 text-green-500" />
                Donasi Terbaru
              </h3>
              <div className="space-y-2">
                {recentDonations.map(donation => (
                  <TransactionItem 
                    key={donation.id}
                    name={donation.nama}
                    amount={donation.jumlah}
                    date={formatDate(donation.tanggal_donasi)}
                    type={donation.metode}
                  />
                ))}
              </div>
              <button className="mt-6 w-full py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                Lihat Semua Donasi
              </button>
            </motion.div>
          )}

          {/* Recent Expenses */}
          {loading ? (
            <TransactionSkeleton />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-red-500" />
                Pengeluaran Terbaru
              </h3>
              <div className="space-y-2">
                {recentExpenses.map(expense => (
                  <TransactionItem 
                    key={expense.id}
                    name={expense.nama_pengeluaran}
                    amount={expense.jumlah}
                    date={formatDate(expense.tanggal_pengeluaran)}
                    type={expense.kategori}
                    isExpense={true}
                  />
                ))}
              </div>
              <button className="mt-6 w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                Lihat Semua Pengeluaran
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
