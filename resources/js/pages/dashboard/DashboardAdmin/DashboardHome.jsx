import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMosque, faMoneyBillWave, faHandHoldingDollar, faBuilding, 
  faChartLine, faArrowUp, faArrowDown, faTrophy, faCalendarAlt,
  faSync, faFilter, faCheckCircle, faIdCard, faUser
} from "@fortawesome/free-solid-svg-icons";
import WelcomeCard from "../../../components/ecommerce/WelcomeCard";
import MonthlyReportChart from "../../../components/ecommerce/MonthlyReportChart";
import { Spinner } from "@material-tailwind/react";

export default function DashboardHome() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(true);
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

  // Format date to Indonesian format with Asia/Jakarta timezone
  const formatDate = (dateString) => {
    // Create date object from the UTC date string
    const utcDate = new Date(dateString);
    
    // Format options for Indonesia locale with explicit timezone
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    };
    
    // Format the date with the Indonesia locale and Asia/Jakarta timezone
    return new Intl.DateTimeFormat('id-ID', options).format(utcDate);
  };

  // Handle refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    await fetchDonations();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    // In a real application, this would trigger a new API call with the filter
  };

  // Fetch donation data from the API
  const fetchDonations = async () => {
    try {
      setDonationsLoading(true);
      
      // Fetch real donation data from the API
      const response = await axios.get('/api/donations');
      console.log("Fetched donations for dashboard:", response.data);
      
      // Process the donation data
      if (response.data && response.data.length > 0) {
        // Calculate total donation amount
        const totalAmount = response.data.reduce((sum, donation) => sum + parseFloat(donation.jumlah), 0);
        
        // Update stats with real donation data
        setStats(prevStats => ({
          ...prevStats,
          totalDonations: totalAmount,
          donorCount: response.data.length
        }));
        
        // Set recent donations (latest 5)
        const sortedDonations = [...response.data].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        ).slice(0, 5);
        
        setRecentDonations(sortedDonations);
      }
    } catch (error) {
      console.error("Error fetching donation data:", error);
    } finally {
      setDonationsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // This API call is mocked for now, replace with actual endpoint when available
      // Since the API might not be fully implemented yet, using dummy data as fallback
      
      /* Uncomment when API is ready
      const response = await axios.get('/api/admin/dashboard-stats');
      setStats(response.data.stats);
      setRecentExpenses(response.data.recentExpenses);
      */
      
      // Dummy data for expenses
      setRecentExpenses([
        { id: 1, nama_pengeluaran: "Pembelian Semen", jumlah: 15000000, tanggal_pengeluaran: "2025-06-14", kategori: "Material Bangunan" },
        { id: 2, nama_pengeluaran: "Upah Tukang", jumlah: 10000000, tanggal_pengeluaran: "2025-06-13", kategori: "Jasa" },
        { id: 3, nama_pengeluaran: "Besi Beton", jumlah: 7500000, tanggal_pengeluaran: "2025-06-10", kategori: "Material Bangunan" },
        { id: 4, nama_pengeluaran: "Biaya Konsultasi Arsitek", jumlah: 5000000, tanggal_pengeluaran: "2025-06-08", kategori: "Jasa" },
        { id: 5, nama_pengeluaran: "Keramik Lantai", jumlah: 12000000, tanggal_pengeluaran: "2025-06-05", kategori: "Material Bangunan" }
      ]);
      
      // Calculate total expenses
      const totalExpenses = recentExpenses.reduce((sum, expense) => sum + expense.jumlah, 0);
      
      // Update stats with expense data
      setStats(prevStats => ({
        ...prevStats,
        totalExpenses: totalExpenses,
        balance: prevStats.totalDonations - totalExpenses
      }));
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name || "Admin");
    fetchDonations();
    fetchDashboardData();
  }, []);

  // Stat card component with trend indicator
  const StatCard = ({ icon, title, value, trend = 0, color, isLoading = false }) => (
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
            {isLoading ? (
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            ) : (
              <p className="font-bold text-gray-800 text-xl">{value}</p>
            )}
          </div>
        </div>
        {trend !== 0 && !isLoading && (
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

  // Get donor name and email
  const getDonorInfo = (donation) => {
    if (donation.pengguna_id) {
      return {
        name: donation.pengguna?.nama || (donation.name || "Anonymous"),
        email: donation.pengguna?.email || donation.email || "",
        isRegistered: true
      };
    } else if (donation.pengguna && donation.pengguna.nama) {
      return {
        name: donation.pengguna.nama,
        email: donation.pengguna.email || "",
        isRegistered: true
      };
    } else if (donation.anonymous_donor && donation.anonymous_donor.nama) {
      return {
        name: donation.anonymous_donor.nama,
        email: donation.anonymous_donor.email || "",
        isRegistered: false
      };
    } else {
        return {
        name: donation.name || "Anonymous",
        email: donation.email || "",
        isRegistered: false
        };
    }
  };

  // Recent transaction component
  const TransactionItem = ({ donation, isExpense = false }) => {
    if (isExpense) {
      return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3 bg-red-100">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{donation.nama_pengeluaran}</p>
              <div className="flex items-center text-xs text-gray-500">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                {formatDate(donation.tanggal_pengeluaran)}
              </div>
            </div>
          </div>
          <div className="font-medium text-red-500">
            -{formatRupiah(donation.jumlah)}
          </div>
        </div>
      );
    } else {
      // For donations
      const donorInfo = getDonorInfo(donation);
      
      return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
              <FontAwesomeIcon 
                icon={donorInfo.isRegistered ? faUser : faIdCard} 
                className={donorInfo.isRegistered ? "text-blue-500" : "text-gray-500"} 
              />
            </div>
            <div>
              <p className="font-medium text-gray-800">{donorInfo.name}</p>
              <div className="flex items-center text-xs text-gray-500">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                {formatDate(donation.created_at)}
              </div>
            </div>
          </div>
          <div className="font-medium text-green-500">
            +{formatRupiah(donation.jumlah)}
          </div>
        </div>
      );
    }
  };

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
          <StatCard 
            icon={faHandHoldingDollar} 
            title="Total Donasi" 
            value={formatRupiah(stats.totalDonations)} 
            trend={stats.trends.donations}
            color="border-l-4 border-green-500"
            isLoading={donationsLoading}
          />
          <StatCard 
            icon={faMoneyBillWave} 
            title="Total Pengeluaran" 
            value={formatRupiah(stats.totalExpenses)} 
            trend={stats.trends.expenses}
            color="border-l-4 border-red-500"
            isLoading={loading}
          />
          <StatCard 
            icon={faMosque} 
            title="Saldo" 
            value={formatRupiah(stats.balance)} 
            trend={stats.trends.balance}
            color="border-l-4 border-blue-500"
            isLoading={loading || donationsLoading}
          />
          <StatCard 
            icon={faBuilding} 
            title="Jumlah Donatur" 
            value={stats.donorCount} 
            trend={stats.trends.donors}
            color="border-l-4 border-amber-500"
            isLoading={donationsLoading}
          />
        </div>

        {/* Monthly Chart - Now full width */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pemasukan dan Pengeluaran Masjid Taqwa Muhammadiyah</h3>
            <MonthlyReportChart />
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Donations */}
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
              {donationsLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 animate-pulse">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                ))
              ) : recentDonations.length > 0 ? (
                recentDonations.map(donation => (
                  <TransactionItem 
                    key={donation.donasi_id}
                    donation={donation}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Belum ada data donasi
                </div>
              )}
            </div>
            <button 
              onClick={() => window.location.href = '/admin/data-donasi'}
              className="mt-6 w-full py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              Lihat Semua Donasi
            </button>
          </motion.div>

          {/* Recent Expenses */}
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
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 animate-pulse">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                ))
              ) : recentExpenses.length > 0 ? (
                recentExpenses.map(expense => (
                  <TransactionItem 
                    key={expense.id}
                    donation={expense}
                    isExpense={true}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Belum ada data pengeluaran
                </div>
              )}
            </div>
            <button 
              onClick={() => window.location.href = '/admin/pengeluaran'}
              className="mt-6 w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Lihat Semua Pengeluaran
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
