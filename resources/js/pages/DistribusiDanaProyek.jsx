import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NavbarBaru from '../components/LandingPage/NavbarBaru';
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Chart from "react-apexcharts"; // Add this import

const DistribusiDanaProyek = () => {
  const [proyeks, setProyeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDonation: 0,
    totalExpense: 0,
    balance: 0,
    totalProjects: 0
  });
  const [activeTab, setActiveTab] = useState("daftar-proyek");
  
  // New state variables for project detail view
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [projectExpenses, setProjectExpenses] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  // New state variables for expense filtering
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('');
  const [expenseSortOption, setExpenseSortOption] = useState('date-desc');
  const [filteredProjectExpenses, setFilteredProjectExpenses] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  
  // Add new state for project filtering and sorting
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [projectSortOption, setProjectSortOption] = useState('terbaru');
  const [filteredProjects, setFilteredProjects] = useState([]);
  
  // Pagination state for expenses
  const [currentExpensePage, setCurrentExpensePage] = useState(1);
  const [expensesPerPage] = useState(5);
  
  // Add pagination state for statistics tab
  const [currentStatsPage, setCurrentStatsPage] = useState(1);
  const projectsPerStatsPage = 6; // Always show 6 projects per page in stats tab
  
  // New state for all expenses (not just for a single project)
  const [allExpenses, setAllExpenses] = useState([]);
  const [allExpensesLoading, setAllExpensesLoading] = useState(false);
  const [filteredAllExpenses, setFilteredAllExpenses] = useState([]);
  
  // Filter state for all expenses
  const [allExpensesFilter, setAllExpensesFilter] = useState({
    proyek_id: '',
    kategori_pengeluaran_id: '',
    tanggal_start: null,
    tanggal_end: null,
    sortBy: 'date-desc' // Default sort: newest first
  });
  
  // Pagination for all expenses
  const [currentAllExpensesPage, setCurrentAllExpensesPage] = useState(1);
  
  const detailSectionRef = useRef(null);

  // Add pagination state for project grid
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage, setProjectsPerPage] = useState(9); // Default for desktop
  
  // Add useEffect to handle responsive pagination
  useEffect(() => {
    const handleResize = () => {
      // Set cards per page based on screen width
      if (window.innerWidth < 640) { // Mobile
        setProjectsPerPage(4);
      } else if (window.innerWidth < 1024) { // Tablet
        setProjectsPerPage(6);
      } else { // Desktop
        setProjectsPerPage(9);
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Don't set auth error for public pages
      return null;
    }
    return {
      Authorization: `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects
        const proyeksResponse = await axios.get('/api/ProyekPembangunan');
        const proyeksData = proyeksResponse.data.data || proyeksResponse.data;
        
        // Fetch all expenses (with auth headers if needed)
        let pengeluaransData = [];
        try {
          const headers = getAuthHeaders();
          const pengeluaransResponse = headers ? 
            await axios.get('/api/Pengeluaran', { headers }) : 
            await axios.get('/api/Pengeluaran');
          pengeluaransData = pengeluaransResponse.data.data || pengeluaransResponse.data;
        } catch (err) {
          console.warn("Could not fetch expenses with authentication, using public data only");
        }
        
        // Fetch donation stats
        const donationResponse = await axios.get('/api/donations');
        const donations = donationResponse.data || [];
        
        // Calculate total donation
        const totalDonation = donations
          .filter(d => d.status === 'Diterima')
          .reduce((sum, donation) => sum + parseInt(donation.jumlah || 0), 0);
        
        // Calculate total expense
        const totalExpense = pengeluaransData.reduce((sum, expense) => 
          sum + parseInt(expense.jumlah || 0), 0);
        
        // Calculate balance
        const balance = totalDonation - totalExpense;
        
        // Group expenses by project
        const expensesByProject = {};
        pengeluaransData.forEach(expense => {
          const projectId = expense.proyek_id;
          if (!expensesByProject[projectId]) {
            expensesByProject[projectId] = [];
          }
          expensesByProject[projectId].push(expense);
        });
        
        // Enhance projects with expense data
        const enhancedProyeks = proyeksData.map(proyek => {
          const projectExpenses = expensesByProject[proyek.proyek_id] || [];
          const totalProjectExpense = projectExpenses.reduce(
            (sum, expense) => sum + parseInt(expense.jumlah || 0), 0
          );
          
          return {
            ...proyek,
            expenses: projectExpenses,
            totalExpense: totalProjectExpense,
            progress: Math.min(100, Math.round((totalProjectExpense / parseInt(proyek.target_dana || 1)) * 100))
          };
        });
        
        setProyeks(enhancedProyeks);
        setStats({
          totalDonation,
          totalExpense,
          balance,
          totalProjects: proyeksData.length
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "Rp 0";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Tab selection handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // If changing to the project-expenses tab, fetch all expenses
    if (tab === "project-expenses" && allExpenses.length === 0) {
      fetchAllExpenses();
    }
    
    // If changing to the statistik-proyek tab, make sure we have categories
    if ((tab === "statistik-proyek" || tab === "project-expenses") && kategoris.length === 0) {
      fetchKategoris();
    }
  };

  // Update handleDetailClick to reset pagination when loading a new project
  const handleDetailClick = async (projectId) => {
    // If already selected, close the detail view
    if (selectedProject === projectId) {
      setSelectedProject(null);
      setProjectDetail(null);
      setProjectExpenses([]);
      return;
    }
    
    try {
      // Set loading first before anything else
      setDetailLoading(true);
      setSelectedProject(projectId);
      
      // Reset filtering and pagination when loading a new project
      setExpenseSearchTerm('');
      setExpenseCategoryFilter('');
      setExpenseSortOption('date-desc');
      setCurrentExpensePage(1);
      
      console.log('Fetching project details for ID:', projectId);
      
      // Fetch project details using the public endpoint
      const response = await axios.get(`/api/ProyekPembangunan/${projectId}`);
      console.log('Project details response:', response);
      
      if (!response.data || response.status !== 200) {
        throw new Error('Failed to fetch project data');
      }
      
      const projectData = response.data;
      
      // Fetch project expenses if not included in response
      let expenses = projectData.pengeluaran || [];
      if (!expenses.length) {
        const expensesResponse = await axios.get('/api/Pengeluaran', {
          params: { proyek_id: projectId }
        });
        expenses = expensesResponse.data.data || expensesResponse.data;
      }
      
      // Calculate stats
      const totalExpense = expenses.reduce((sum, p) => {
        const amount = typeof p.jumlah === 'string' ? 
          parseFloat(p.jumlah.replace(/[^\d.-]/g, '')) : 
          parseFloat(p.jumlah) || 0;
        return sum + amount;
      }, 0);
      
      const targetDana = parseFloat(projectData.target_dana) || 0;
      const progress = targetDana ? Math.min(100, Math.round((totalExpense / targetDana) * 100)) : 0;
      
      setProjectDetail({
        ...projectData,
        totalExpense,
        progress
      });
      setProjectExpenses(expenses);
      setFilteredProjectExpenses(expenses);  // Initialize filtered expenses
      setAuthError(null);
      
      // Scroll to detail section after a short delay to ensure rendering
      setTimeout(() => {
        if (detailSectionRef.current) {
          detailSectionRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
          });
        }
      }, 300);
      
    } catch (err) {
      console.error("Error fetching project details:", err);
      // Log the error details
      if (err.response) {
        console.error("Error response:", err.response.status, err.response.data);
      }
      setError("Gagal memuat detail proyek. Silakan coba lagi nanti.");
      setDetailLoading(false);
    } finally {
      // Small delay to ensure loading spinner is visible even for fast connections
      setTimeout(() => {
        setDetailLoading(false);
      }, 500);
    }
  };

  // Update the useEffect for filtering to also reset pagination when filters change
  useEffect(() => {
    if (!projectExpenses.length) {
      setFilteredProjectExpenses([]);
      return;
    }
    
    let filtered = [...projectExpenses];
    
    // Apply search filter
    if (expenseSearchTerm.trim() !== '') {
      filtered = filtered.filter(expense => 
        expense.nama_pengeluaran.toLowerCase().includes(expenseSearchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (expenseCategoryFilter) {
      filtered = filtered.filter(expense => 
        expense.kategori_pengeluaran_id?.toString() === expenseCategoryFilter.toString()
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (expenseSortOption) {
        case 'date-desc': // Newest first (default)
          return new Date(b.tanggal_pengeluaran || b.created_at) - new Date(a.tanggal_pengeluaran || a.created_at);
        case 'date-asc': // Oldest first
          return new Date(a.tanggal_pengeluaran || a.created_at) - new Date(b.tanggal_pengeluaran || b.created_at);
        case 'amount-desc': // Largest amount first
          const amountB = typeof b.jumlah === 'string' ? 
            parseFloat(b.jumlah.replace(/[^\d.-]/g, '')) : 
            parseFloat(b.jumlah) || 0;
          const amountA = typeof a.jumlah === 'string' ? 
            parseFloat(a.jumlah.replace(/[^\d.-]/g, '')) : 
            parseFloat(a.jumlah) || 0;
          return amountB - amountA;
        case 'amount-asc': // Smallest amount first
          const amountB2 = typeof b.jumlah === 'string' ? 
            parseFloat(b.jumlah.replace(/[^\d.-]/g, '')) : 
            parseFloat(b.jumlah) || 0;
          const amountA2 = typeof a.jumlah === 'string' ? 
            parseFloat(a.jumlah.replace(/[^\d.-]/g, '')) : 
            parseFloat(a.jumlah) || 0;
          return amountA2 - amountB2;
        default:
          return new Date(b.tanggal_pengeluaran || b.created_at) - new Date(a.tanggal_pengeluaran || a.created_at);
      }
    });
    
    setFilteredProjectExpenses(filtered);
    // Reset to first page when filters change
    setCurrentExpensePage(1);
  }, [projectExpenses, expenseSearchTerm, expenseCategoryFilter, expenseSortOption]);

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Umum';
    
    const category = kategoris.find(k => 
      (k.kategori_pengeluaran_id && k.kategori_pengeluaran_id.toString() === categoryId.toString()) || 
      (k.id && k.id.toString() === categoryId.toString())
    );
    
    return category ? category.nama_kategori : 'Umum';
  };

  // Modify the useEffect for filtering and sorting projects
  useEffect(() => {
    if (!proyeks.length) {
      setFilteredProjects([]);
      return;
    }
    
    let filtered = [...proyeks];
    
    // Apply search filter if there is a search term
    if (projectSearchTerm.trim() !== '') {
      filtered = filtered.filter(proyek => 
        proyek.nama_item.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
        proyek.deskripsi.toLowerCase().includes(projectSearchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (projectStatusFilter !== 'all') {
      filtered = filtered.filter(proyek => {
        if (projectStatusFilter === 'tercapai') {
          return proyek.progress >= 100;
        } else if (projectStatusFilter === 'dalam-proses') {
          return proyek.progress < 100;
        }
        return true;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (projectSortOption) {
        case 'terbaru':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'terlama':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'dialokasikan':
          return b.totalExpense - a.totalExpense;
        case 'belum-dialokasikan':
          // Modified logic: Show projects with 0 totalExpense first
          // Then sort others by remaining funds (target_dana - totalExpense)
          if (a.totalExpense === 0 && b.totalExpense !== 0) return -1;
          if (a.totalExpense !== 0 && b.totalExpense === 0) return 1;
          const remainingA = a.target_dana - a.totalExpense;
          const remainingB = b.target_dana - b.totalExpense;
          return remainingB - remainingA;
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    
    setFilteredProjects(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [proyeks, projectSearchTerm, projectStatusFilter, projectSortOption]);

  // Modify renderProjectGrid function to include pagination
  const renderProjectGrid = () => {
    // If a project is selected and details are loaded or loading, show the full-page detail view
    if (selectedProject) {
        return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
          ref={detailSectionRef}
        >
          {/* Full Page Project Detail */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Detail Header with Back Button */}
            <div className="bg-gradient-to-r from-[#59B997] to-[#3a9b7d] text-white p-6 flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setProjectDetail(null);
                    setProjectExpenses([]);
                  }}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg mr-3 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
                  <span className="ml-1">Kembali</span>
                </button>
                <h2 className="text-xl font-bold">
                  {detailLoading 
                    ? "Memuat Detail Proyek..." 
                    : projectDetail ? `Detail Proyek: ${projectDetail.nama_item}` : "Detail Proyek"}
                </h2>
            </div>
          </div>

            {detailLoading ? (
              <div className="flex flex-col justify-center items-center p-24 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#59B997] mb-4"></div>
                <p className="text-gray-500 mt-4 font-medium">Memuat data proyek...</p>
              </div>
            ) : projectDetail ? (
              <div className="p-6">
                <div className="bg-white rounded-xl overflow-hidden mb-6">
                  <div className="p-4">
                    {/* Project Image */}
                    {projectDetail.gambar && (
                      <div className="mb-6">
                        <img 
                          src={`/storage/${projectDetail.gambar}`} 
                          alt={projectDetail.nama_item} 
                          className="rounded-lg shadow-sm w-full max-h-80 object-cover"
                          onError={(e) => {
                            e.target.src = '/img/logo-app.jpg';
                          }}
                        />
                      </div>
                    )}
                    
                    <p className="text-gray-600 mb-6">{projectDetail.deskripsi}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Progress Pendanaan ({projectDetail.progress}%)
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(projectDetail.totalExpense)} / {formatCurrency(projectDetail.target_dana)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                      <div 
                        className="bg-[#59B997] h-4 rounded-full"
                        style={{ width: `${projectDetail.progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium">Kebutuhan Dana</p>
                        <p className="text-xl font-bold text-blue-800">{formatCurrency(projectDetail.target_dana)}</p>
                        <p className="text-xs text-blue-600 mt-2">Target yang dibutuhkan untuk proyek ini</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <p className="text-sm text-green-600 font-medium">Dana Dialokasikan</p>
                        <p className="text-xl font-bold text-green-800">{formatCurrency(projectDetail.totalExpense)}</p>
                        <p className="text-xs text-green-600 mt-2">Total dana yang telah dialokasikan</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                        <p className="text-sm text-amber-600 font-medium">Tanggal Dibuat</p>
                        <p className="text-xl font-bold text-amber-800">{formatDate(projectDetail.created_at)}</p>
                        <p className="text-xs text-amber-600 mt-2">Waktu pembuatan proyek</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pengeluaran Section */}
                <div className="bg-white shadow rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                    <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                    Riwayat Pengeluaran Proyek
                  </h2>

                  {/* Filter dan Pencarian Pengeluaran */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Search by expense name */}
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari Pengeluaran</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] text-sm"
                            placeholder="Cari berdasarkan nama pengeluaran..."
                            value={expenseSearchTerm}
                            onChange={(e) => setExpenseSearchTerm(e.target.value)}
                          />
          </div>
                      </div>
                      
                      {/* Filter by category */}
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select
                          value={expenseCategoryFilter}
                          onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] text-sm"
                        >
                          <option value="">Semua Kategori</option>
                          {kategoris.map(k => (
                            <option 
                              key={k.kategori_pengeluaran_id || k.id} 
                              value={k.kategori_pengeluaran_id || k.id}
                            >
                              {k.nama_kategori}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Sort options */}
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
                        <select
                          value={expenseSortOption}
                          onChange={(e) => setExpenseSortOption(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] text-sm"
                        >
                          <option value="date-desc">Tanggal Terbaru</option>
                          <option value="date-asc">Tanggal Terlama</option>
                          <option value="amount-desc">Jumlah Terbesar</option>
                          <option value="amount-asc">Jumlah Terkecil</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Reset filter button */}
                    {(expenseSearchTerm || expenseCategoryFilter || expenseSortOption !== 'date-desc') && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            setExpenseSearchTerm('');
                            setExpenseCategoryFilter('');
                            setExpenseSortOption('date-desc');
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center px-3 py-1 bg-white border border-gray-200 rounded-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset Filter
                        </button>
                      </div>
                    )}
                  </div>

                  {projectExpenses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-md font-medium text-gray-700">Belum ada pengeluaran</h3>
                      <p className="mt-1 text-sm text-gray-500">Pengeluaran untuk proyek ini akan ditampilkan di sini</p>
                    </div>
                  ) : filteredProjectExpenses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-md font-medium text-gray-700">Tidak ada pengeluaran yang sesuai</h3>
                      <p className="mt-1 text-sm text-gray-500">Coba ubah filter atau reset pencarian</p>
                      <button 
                        onClick={() => {
                          setExpenseSearchTerm('');
                          setExpenseCategoryFilter('');
                          setExpenseSortOption('date-desc');
                        }}
                        className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset Pencarian
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* Calculate pagination indexes */}
                          {filteredProjectExpenses
                            .slice(
                              (currentExpensePage - 1) * expensesPerPage,
                              currentExpensePage * expensesPerPage
                            )
                            .map((expense, index) => (
                            <tr 
                              key={expense.pengeluaran_id} 
                              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{expense.nama_pengeluaran}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-red-600">{formatCurrency(expense.jumlah)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {getCategoryName(expense.kategori_pengeluaran_id)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{formatDate(expense.tanggal_pengeluaran || expense.created_at)}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 max-w-xs truncate">{expense.keterangan || '-'}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Pagination controls */}
                      {filteredProjectExpenses.length > expensesPerPage && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                          <div className="text-sm text-gray-500">
                            Menampilkan {(currentExpensePage - 1) * expensesPerPage + 1} - {Math.min(currentExpensePage * expensesPerPage, filteredProjectExpenses.length)} dari {filteredProjectExpenses.length} data
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setCurrentExpensePage(prev => Math.max(prev - 1, 1))}
                              disabled={currentExpensePage === 1}
                              className={`px-3 py-1 rounded-md ${
                                currentExpensePage === 1
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              Sebelumnya
                            </button>
                            <div className="flex space-x-1">
                              {Array.from(
                                { length: Math.ceil(filteredProjectExpenses.length / expensesPerPage) },
                                (_, i) => i + 1
                              ).map(number => (
                                <button
                                  key={number}
                                  onClick={() => setCurrentExpensePage(number)}
                                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                                    currentExpensePage === number
                                      ? 'bg-[#59B997] text-white'
                                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                  }`}
                                >
                                  {number}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => setCurrentExpensePage(prev => 
                                Math.min(prev + 1, Math.ceil(filteredProjectExpenses.length / expensesPerPage))
                              )}
                              disabled={currentExpensePage >= Math.ceil(filteredProjectExpenses.length / expensesPerPage)}
                              className={`px-3 py-1 rounded-md ${
                                currentExpensePage >= Math.ceil(filteredProjectExpenses.length / expensesPerPage)
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              Berikutnya
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="bg-white rounded-xl p-8 text-center">
                  <div className="mx-auto h-20 w-20 text-red-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Gagal memuat detail proyek</h3>
                  <p className="text-gray-500 mb-6">Data proyek yang Anda cari tidak dapat dimuat. Silakan coba lagi nanti.</p>
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setProjectDetail(null);
                      setProjectExpenses([]);
                      setError(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#59B997] hover:bg-[#4ca583] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59B997]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke daftar proyek
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // Calculate pagination indexes
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    // Function to change page
    const paginate = (pageNumber) => {
      setCurrentPage(pageNumber);
      // Scroll to top of project grid
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Loading state
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#59B997]"></div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      );
    }

    // Empty state
    if (proyeks.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700">Belum ada proyek</h3>
          <p className="mt-1 text-gray-500">Proyek pembangunan akan ditampilkan di sini</p>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Auth Error Alert */}
        {false && authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
            <a href="/login" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Login
            </a>
          </div>
        )}
        
        {/* Filter and Sort Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter & Urutkan Proyek</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cari Proyek</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] text-sm"
                    placeholder="Cari berdasarkan nama atau deskripsi..."
                    value={projectSearchTerm}
                    onChange={(e) => setProjectSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Proyek</label>
                <select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="dalam-proses">Dalam Proses</option>
                  <option value="tercapai">Tercapai</option>
                </select>
              </div>
              
              {/* Sort Options */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
                <select
                  value={projectSortOption}
                  onChange={(e) => setProjectSortOption(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] text-sm"
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="terlama">Terlama</option>
                  <option value="dialokasikan">Dana Dialokasikan Tertinggi</option>
                  <option value="belum-dialokasikan">Dana Belum Dialokasikan</option>
                </select>
              </div>
            </div>
            
            {/* Reset filter button */}
            {(projectSearchTerm || projectStatusFilter !== 'all' || projectSortOption !== 'terbaru') && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    setProjectSearchTerm('');
                    setProjectStatusFilter('all');
                    setProjectSortOption('terbaru');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center px-3 py-1 bg-white border border-gray-200 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Project Count and Pagination Info */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredProjects.length} proyek
          </div>
          {filteredProjects.length > projectsPerPage && (
            <div className="text-sm text-gray-500">
              Menampilkan {indexOfFirstProject + 1}-{Math.min(indexOfLastProject, filteredProjects.length)} dari {filteredProjects.length} proyek
            </div>
          )}
        </div>
        
        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">Tidak ada proyek yang sesuai</h3>
            <p className="mt-1 text-gray-500">Coba ubah filter atau reset pencarian</p>
            <button 
              onClick={() => {
                setProjectSearchTerm('');
                setProjectStatusFilter('all');
                setProjectSortOption('terbaru');
              }}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProjects.map((proyek) => (
              <motion.div 
              key={proyek.proyek_id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Project Image */}
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={proyek.gambar ? `/storage/${proyek.gambar}` : '/img/logo-app.jpg'} 
                  alt={proyek.nama_item} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = '/img/logo-app.jpg';
                  }}
                />
              </div>
              
              {/* Project Details */}
              <div className="p-5 flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{proyek.nama_item}</h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">{proyek.deskripsi}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Kebutuhan Dana</p>
                    <p className="font-semibold text-sm">{formatCurrency(proyek.target_dana)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dana Dialokasikan</p>
                    <p className="font-semibold text-sm">{formatCurrency(proyek.totalExpense)}</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress Pendanaan</span>
                    <span>{proyek.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${
                          proyek.progress >= 100 ? 'bg-green-500' : 'bg-[#59B997]'
                        }`}
                      style={{ width: `${proyek.progress}%` }}
                    ></div>
                  </div>
                  {proyek.progress >= 100 && (
                    <p className="text-xs text-green-600 font-medium mt-1">Target tercapai!</p>
                  )}
                </div>
              </div>
              
              {/* Detail Button */}
              <div className="px-5 pb-5 mt-auto">
                  <button 
                    onClick={() => handleDetailClick(proyek.proyek_id)}
                    className="w-full text-center py-2 px-4 bg-[#59B997] hover:bg-[#4ca583] text-white font-medium rounded-md transition-colors"
                >
                  Detail Proyek
                  </button>
              </div>
              </motion.div>
            ))}
            </div>
        )}
        
        {/* Pagination Controls */}
        {filteredProjects.length > projectsPerPage && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  // Show at most 5 page numbers
                  .filter(number => {
                    if (totalPages <= 5) return true;
                    if (number === 1 || number === totalPages) return true;
                    if (number >= currentPage - 1 && number <= currentPage + 1) return true;
                    return false;
                  })
                  .map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${
                        currentPage === number
                          ? 'bg-[#59B997] text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                
                {/* Add ellipsis if needed */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2 py-1 text-gray-500">...</span>
                )}
      </div>
              
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </motion.div>
    );
  };

  // Add function to fetch all expenses
  useEffect(() => {
    // Only fetch all expenses when on the project-expenses tab
    if (activeTab === "project-expenses") {
      fetchAllExpenses();
    }
  }, [activeTab, allExpensesFilter]);
  
  // Function to fetch all expenses with filters
  const fetchAllExpenses = async () => {
    try {
      setAllExpensesLoading(true);
      
      // Prepare params for API call
      const params = { ...allExpensesFilter };
      
      // Format dates for API
      if (allExpensesFilter.tanggal_start instanceof Date) {
        params.tanggal_start = allExpensesFilter.tanggal_start.toISOString().split('T')[0];
      }
      if (allExpensesFilter.tanggal_end instanceof Date) {
        params.tanggal_end = allExpensesFilter.tanggal_end.toISOString().split('T')[0];
      }
      
      // Get auth headers if available
      const headers = getAuthHeaders();
      
      // Make API call with or without auth headers
      const response = headers 
        ? await axios.get('/api/Pengeluaran', { params, headers })
        : await axios.get('/api/Pengeluaran', { params });
      
      const expensesData = response.data.data || response.data;
      
      // Fetch project details for each expense if not included
      const enhancedExpenses = await Promise.all(
        expensesData.map(async (expense) => {
          // If expense already has project details, use them
          if (expense.proyek) {
            return expense;
          }
          
          // Find project in our cached projects
          const existingProject = proyeks.find(p => p.proyek_id === expense.proyek_id);
          if (existingProject) {
            return { ...expense, proyek: existingProject };
          }
          
          // If we don't have the project details, try to fetch them
          try {
            const projectResponse = await axios.get(`/api/ProyekPembangunan/${expense.proyek_id}`);
            return { ...expense, proyek: projectResponse.data };
          } catch (err) {
            // If we can't fetch project details, return expense as is
            return expense;
          }
        })
      );
      
      // Apply client-side sorting if needed
      const sortedExpenses = [...enhancedExpenses].sort((a, b) => {
        switch (allExpensesFilter.sortBy) {
          case 'date-desc': // Newest first (default)
            return new Date(b.tanggal_pengeluaran || b.created_at) - new Date(a.tanggal_pengeluaran || a.created_at);
          case 'date-asc': // Oldest first
            return new Date(a.tanggal_pengeluaran || a.created_at) - new Date(b.tanggal_pengeluaran || b.created_at);
          case 'amount-desc': // Largest amount first
            const amountB = typeof b.jumlah === 'string' ? 
              parseFloat(b.jumlah.replace(/[^\d.-]/g, '')) : 
              parseFloat(b.jumlah) || 0;
            const amountA = typeof a.jumlah === 'string' ? 
              parseFloat(a.jumlah.replace(/[^\d.-]/g, '')) : 
              parseFloat(a.jumlah) || 0;
            return amountB - amountA;
          case 'amount-asc': // Smallest amount first
            const amountB2 = typeof b.jumlah === 'string' ? 
              parseFloat(b.jumlah.replace(/[^\d.-]/g, '')) : 
              parseFloat(b.jumlah) || 0;
            const amountA2 = typeof a.jumlah === 'string' ? 
              parseFloat(a.jumlah.replace(/[^\d.-]/g, '')) : 
              parseFloat(a.jumlah) || 0;
            return amountA2 - amountB2;
          default:
            return new Date(b.tanggal_pengeluaran || b.created_at) - new Date(a.tanggal_pengeluaran || a.created_at);
        }
      });
      
      setAllExpenses(sortedExpenses);
      setFilteredAllExpenses(sortedExpenses);
      setCurrentAllExpensesPage(1); // Reset to first page
    } catch (err) {
      console.error("Error fetching all expenses:", err);
      setAllExpenses([]);
      setFilteredAllExpenses([]);
    } finally {
      setAllExpensesLoading(false);
    }
  };
  
  // Function to handle filter changes for all expenses
  const handleAllExpensesFilterChange = (e) => {
    const { name, value } = e.target;
    setAllExpensesFilter(prev => ({ ...prev, [name]: value }));
  };
  
  // Function to handle date filter changes
  const handleStartDateChange = (date) => {
    setAllExpensesFilter(prev => ({ ...prev, tanggal_start: date }));
  };
  
  const handleEndDateChange = (date) => {
    setAllExpensesFilter(prev => ({ ...prev, tanggal_end: date }));
  };
  
  // Function to clear all filters
  const clearAllExpensesFilters = () => {
    setAllExpensesFilter({
      proyek_id: '',
      kategori_pengeluaran_id: '',
      tanggal_start: null,
      tanggal_end: null,
      sortBy: 'date-desc' // Reset to default sort
    });
  };

  // Function to fetch categories if needed
  const fetchKategoris = async () => {
    if (kategoris.length > 0) return; // Don't fetch if we already have them
    
    try {
      // Don't require authentication for categories
      const response = await axios.get('/api/KategoriPengeluaran');
      const kategorisData = response.data.data || response.data;
      setKategoris(kategorisData);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Now update the renderTabContent function to include the updated project-expenses tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "daftar-proyek":
        return renderProjectGrid();
        
      case "statistik-proyek":
        // Loading state
        if (loading) {
          return (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#59B997]"></div>
            </div>
          );
        }

        // Error state
        if (error) {
          return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          );
        }

        // Calculate pagination for project progress
        const indexOfLastStatsProject = currentStatsPage * projectsPerStatsPage;
        const indexOfFirstStatsProject = indexOfLastStatsProject - projectsPerStatsPage;
        const currentStatsProjects = proyeks.slice(indexOfFirstStatsProject, indexOfLastStatsProject);
        const totalStatsPages = Math.ceil(proyeks.length / projectsPerStatsPage);

        // Function to change stats page
        const paginateStats = (pageNumber) => {
          setCurrentStatsPage(pageNumber);
        };

        return (
          <div className="space-y-8">
            {/* Overall Stats - Moved to the top */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                Ringkasan Statistik
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Distribusi Dana</h3>
                  
                  {/* Add Pie Chart for Fund Distribution */}
                  <div className="h-64">
                    <Chart 
                      options={{
                        labels: ['Dana Dialokasikan', 'Dana Belum Dialokasikan'],
                        colors: ['#59B997', '#3B82F6'],
                        legend: {
                          position: 'bottom',
                          fontFamily: 'inherit',
                          fontSize: '14px',
                          fontWeight: 500,
                          markers: {
                            width: 12,
                            height: 12,
                            radius: 6
                          },
                          itemMargin: {
                            horizontal: 10,
                            vertical: 5
                          }
                        },
                        tooltip: {
                          enabled: true,
                          style: {
                            fontSize: '14px',
                            fontFamily: 'inherit'
                          },
                          y: {
                            formatter: (val) => formatCurrency(val),
                            title: {
                              formatter: (seriesName) => seriesName,
                            },
                          },
                          theme: 'light',
                          custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                            const label = w.config.labels[seriesIndex];
                            const value = formatCurrency(series[seriesIndex]);
                            const percent = Math.round((series[seriesIndex] / series.reduce((a, b) => a + b)) * 100);
                            const color = w.config.colors[seriesIndex];
                            
                            return `
                              <div class="py-2 px-3 rounded-lg shadow-lg" style="background: white; border-left: 4px solid ${color}">
                                <div class="font-medium text-gray-800">${label}</div>
                                <div class="text-lg font-bold">${value}</div>
                                <div class="text-sm text-gray-600">${percent}% dari total</div>
                              </div>
                            `;
                          },
                          fixed: {
                            enabled: false,
                            position: 'topRight',
                            offsetX: 0,
                            offsetY: 0,
                          },
                          marker: {
                            show: true,
                          },
                          items: {
                            display: 'flex',
                          },
                          intersect: false,
                          shared: true,
                          fillSeriesColor: false,
                          onDatasetHover: {
                            highlightDataSeries: true,
                          },
                        },
                        dataLabels: {
                          enabled: true,
                          formatter: function (val, opts) {
                            return Math.round(val) + '%';
                          },
                          style: {
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            fontWeight: 'medium',
                            colors: ['#fff']
                          },
                          dropShadow: {
                            enabled: true,
                            color: '#000',
                            top: 0,
                            left: 0,
                            blur: 3,
                            opacity: 0.2
                          },
                          background: {
                            enabled: true,
                            foreColor: '#fff',
                            borderRadius: 2,
                            padding: 4,
                            opacity: 0.8,
                            borderWidth: 1,
                            borderColor: '#fff'
                          },
                        },
                        plotOptions: {
                          pie: {
                            expandOnClick: false,
                            donut: {
                              size: '60%',
                              background: 'transparent',
                              labels: {
                                show: true,
                                name: {
                                  show: true,
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  offsetY: -8
                                },
                                value: {
                                  show: true,
                                  fontSize: '13px',
                                  fontWeight: 400,
                                  formatter: function(val) {
                                    // Truncate long currency values
                                    const formatted = formatCurrency(val);
                                    if (formatted.length > 10) {
                                      return formatted.substring(0, 9) + '...';
                                    }
                                    return formatted;
                                  }
                                },
                                total: {
                                  show: true,
                                  label: 'Total',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  formatter: function(w) {
                                    const total = w.globals.seriesTotals.reduce((a, b) => a + b);
                                    // Truncate long currency values
                                    const formatted = formatCurrency(total);
                                    if (formatted.length > 10) {
                                      return formatted.substring(0, 9) + '...';
                                    }
                                    return formatted;
                                  }
                                }
                              }
                            }
                          }
                        },
                        states: {
                          hover: {
                            filter: {
                              type: 'none',
                            }
                          },
                          active: {
                            filter: {
                              type: 'none',
                            }
                          }
                        },
                        stroke: {
                          width: 2,
                          colors: ['#fff']
                        },
                        responsive: [{
                          breakpoint: 480,
                          options: {
                            chart: {
                              height: 240
                            },
                            legend: {
                              position: 'bottom',
                              fontSize: '12px'
                            },
                            plotOptions: {
                              pie: {
                                donut: {
                                  labels: {
                                    show: true,
                                    name: {
                                      fontSize: '10px',
                                    },
                                    value: {
                                      fontSize: '10px',
                                    },
                                    total: {
                                      fontSize: '10px',
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }]
                      }}
                      series={[stats.totalExpense, stats.balance]}
                      type="donut"
                      height="100%"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#59B997] mr-2"></div>
                      <span className="text-sm text-gray-600 mr-2">Dana Dialokasikan:</span>
                      <span className="text-sm font-medium">{formatCurrency(stats.totalExpense)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-600 mr-2">Dana Belum Dialokasikan:</span>
                      <span className="text-sm font-medium">{formatCurrency(stats.balance)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                      <span className="text-sm text-gray-600 mr-2">Total Donasi:</span>
                      <span className="text-sm font-medium">{formatCurrency(stats.totalDonation)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Status Proyek</h3>
                  
                  {/* Add Pie Chart for Project Status */}
                  <div className="h-64">
                    <Chart 
                      options={{
                        labels: ['Proyek Tercapai', 'Dalam Progress'],
                        colors: ['#22C55E', '#EAB308'],
                        legend: {
                          position: 'bottom',
                          fontFamily: 'inherit',
                          fontSize: '14px',
                          fontWeight: 500,
                          markers: {
                            width: 12,
                            height: 12,
                            radius: 6
                          },
                          itemMargin: {
                            horizontal: 10,
                            vertical: 5
                          }
                        },
                        tooltip: {
                          enabled: true,
                          style: {
                            fontSize: '14px',
                            fontFamily: 'inherit'
                          },
                          y: {
                            formatter: (val) => `${Math.round(val)}%`,
                            title: {
                              formatter: (seriesName) => seriesName,
                            },
                          },
                          theme: 'light',
                          custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                            const label = w.config.labels[seriesIndex];
                            const value = series[seriesIndex];
                            const percent = Math.round((series[seriesIndex] / series.reduce((a, b) => a + b)) * 100);
                            const color = w.config.colors[seriesIndex];
                            const total = series.reduce((a, b) => a + b);
                            
                            return `
                              <div class="py-2 px-3 rounded-lg shadow-lg" style="background: white; border-left: 4px solid ${color}">
                                <div class="font-medium text-gray-800">${label}</div>
                                <div class="text-lg font-bold">${value} proyek</div>
                                <div class="text-sm text-gray-600">${percent}% dari ${total} proyek</div>
                              </div>
                            `;
                          },
                          fixed: {
                            enabled: false,
                            position: 'topRight',
                            offsetX: 0,
                            offsetY: 0,
                          },
                          marker: {
                            show: true,
                          },
                          items: {
                            display: 'flex',
                          },
                          intersect: false,
                          shared: true,
                          fillSeriesColor: false,
                          onDatasetHover: {
                            highlightDataSeries: true,
                          },
                        },
                        dataLabels: {
                          enabled: true,
                          formatter: function (val, opts) {
                            return Math.round(val) + '%';
                          },
                          style: {
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            fontWeight: 'medium',
                            colors: ['#fff']
                          },
                          dropShadow: {
                            enabled: true,
                            color: '#000',
                            top: 0,
                            left: 0,
                            blur: 3,
                            opacity: 0.2
                          },
                          background: {
                            enabled: true,
                            foreColor: '#fff',
                            borderRadius: 2,
                            padding: 4,
                            opacity: 0.8,
                            borderWidth: 1,
                            borderColor: '#fff'
                          },
                        },
                        plotOptions: {
                          pie: {
                            expandOnClick: false,
                            donut: {
                              size: '60%',
                              background: 'transparent',
                              labels: {
                                show: true,
                                name: {
                                  show: true,
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  offsetY: -8
                                },
                                value: {
                                  show: true,
                                  fontSize: '13px',
                                  fontWeight: 400,
                                  formatter: function(val) {
                                    return val + ' proyek';
                                  }
                                },
                                total: {
                                  show: true,
                                  label: 'Total',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  formatter: function(w) {
                                    const total = w.globals.seriesTotals.reduce((a, b) => a + b);
                                    return total + ' proyek';
                                  }
                                }
                              }
                            }
                          }
                        },
                        states: {
                          hover: {
                            filter: {
                              type: 'none',
                            }
                          },
                          active: {
                            filter: {
                              type: 'none',
                            }
                          }
                        },
                        stroke: {
                          width: 2,
                          colors: ['#fff']
                        },
                        responsive: [{
                          breakpoint: 480,
                          options: {
                            chart: {
                              height: 240
                            },
                            legend: {
                              position: 'bottom',
                              fontSize: '12px'
                            },
                            plotOptions: {
                              pie: {
                                donut: {
                                  labels: {
                                    show: true,
                                    name: {
                                      fontSize: '10px',
                                    },
                                    value: {
                                      fontSize: '10px',
                                    },
                                    total: {
                                      fontSize: '10px',
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }]
                      }}
                      series={[
                        proyeks.filter(p => p.progress >= 100).length, 
                        proyeks.filter(p => p.progress < 100).length
                      ]}
                      type="donut"
                      height="100%"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Proyek Tercapai:</span>
                      </div>
                      <span className="text-sm font-medium">
                        {proyeks.filter(p => p.progress >= 100).length} dari {proyeks.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Dalam Progress:</span>
                      </div>
                      <span className="text-sm font-medium">
                        {proyeks.filter(p => p.progress < 100).length} dari {proyeks.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                        <span className="text-sm text-gray-600">Total Proyek:</span>
                      </div>
                      <span className="text-sm font-medium">{proyeks.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Project Progress Chart - Now below with pagination */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                Progress Proyek Pembangunan
              </h2>
              
              {proyeks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Belum ada data proyek</h3>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {currentStatsProjects.map((proyek) => (
                      <div key={proyek.proyek_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-gray-800">{proyek.nama_item}</h3>
                          <span className="text-sm font-medium">
                            {proyek.progress}% Tercapai
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              proyek.progress >= 100 ? 'bg-green-500' : 'bg-[#59B997]'
                            }`}
                            style={{ width: `${proyek.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Target: {formatCurrency(proyek.target_dana)}</span>
                          <span>Dialokasikan: {formatCurrency(proyek.totalExpense)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls for Stats */}
                  {proyeks.length > projectsPerStatsPage && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => paginateStats(Math.max(1, currentStatsPage - 1))}
                          disabled={currentStatsPage === 1}
                          className={`px-3 py-1 rounded-md ${
                            currentStatsPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex space-x-1">
                          {Array.from({ length: totalStatsPages }, (_, i) => i + 1)
                            // Show at most 5 page numbers
                            .filter(number => {
                              if (totalStatsPages <= 5) return true;
                              if (number === 1 || number === totalStatsPages) return true;
                              if (number >= currentStatsPage - 1 && number <= currentStatsPage + 1) return true;
                              return false;
                            })
                            .map(number => (
                              <button
                                key={number}
                                onClick={() => paginateStats(number)}
                                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                                  currentStatsPage === number
                                    ? 'bg-[#59B997] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                              >
                                {number}
                              </button>
                            ))}
                          
                          {/* Add ellipsis if needed */}
                          {totalStatsPages > 5 && currentStatsPage < totalStatsPages - 2 && (
                            <span className="px-2 py-1 text-gray-500">...</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => paginateStats(Math.min(totalStatsPages, currentStatsPage + 1))}
                          disabled={currentStatsPage === totalStatsPages}
                          className={`px-3 py-1 rounded-md ${
                            currentStatsPage === totalStatsPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case "project-expenses":
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Filter Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                  Filter Pengeluaran
                </h2>
                <button 
                  onClick={clearAllExpensesFilters}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reset Filter
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proyek</label>
                  <select 
                    name="proyek_id" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]" 
                    value={allExpensesFilter.proyek_id} 
                    onChange={handleAllExpensesFilterChange}
                  >
                    <option value="">Semua Proyek</option>
                    {proyeks.map(p => (
                      <option key={p.proyek_id} value={p.proyek_id}>
                        {p.nama_item}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select 
                    name="kategori_pengeluaran_id" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]" 
                    value={allExpensesFilter.kategori_pengeluaran_id} 
                    onChange={handleAllExpensesFilterChange}
                  >
                    <option value="">Semua Kategori</option>
                    {kategoris.map(k => (
                      <option key={k.kategori_pengeluaran_id || k.id} value={k.kategori_pengeluaran_id || k.id}>
                        {k.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                  <DatePicker
                    selected={allExpensesFilter.tanggal_start}
                    onChange={handleStartDateChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]"
                    placeholderText="Pilih tanggal mulai"
                    dateFormat="yyyy-MM-dd"
                    isClearable
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                  <DatePicker
                    selected={allExpensesFilter.tanggal_end}
                    onChange={handleEndDateChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]"
                    placeholderText="Pilih tanggal akhir"
                    dateFormat="yyyy-MM-dd"
                    isClearable
                    minDate={allExpensesFilter.tanggal_start}
                  />
                </div>
              </div>
              
              {/* Add sorting options */}
              <div className="mt-4 flex items-center">
                <label className="block text-sm font-medium text-gray-700 mr-2">Urutkan:</label>
                <select 
                  name="sortBy" 
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]" 
                  value={allExpensesFilter.sortBy} 
                  onChange={handleAllExpensesFilterChange}
                >
                  <option value="date-desc">Tanggal Terbaru</option>
                  <option value="date-asc">Tanggal Terlama</option>
                  <option value="amount-desc">Jumlah Terbesar</option>
                  <option value="amount-asc">Jumlah Terkecil</option>
                </select>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                    Riwayat Pengeluaran
                  </h2>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {filteredAllExpenses.length} Pengeluaran
                  </div>
                </div>
              </div>

              {allExpensesLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#59B997]"></div>
                </div>
              ) : filteredAllExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Tidak ada data pengeluaran</h3>
                  <p className="mt-1 text-gray-500">Tidak ada pengeluaran yang sesuai dengan filter</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyek</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAllExpenses
                        .slice(
                          (currentAllExpensesPage - 1) * expensesPerPage,
                          currentAllExpensesPage * expensesPerPage
                        )
                        .map((expense, index) => (
                        <tr 
                          key={expense.pengeluaran_id} 
                          className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{expense.nama_pengeluaran}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-red-600">{formatCurrency(expense.jumlah)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {expense.proyek?.nama_item || 
                               proyeks.find(p => p.proyek_id === expense.proyek_id)?.nama_item || 
                               '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {getCategoryName(expense.kategori_pengeluaran_id)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(expense.tanggal_pengeluaran || expense.created_at)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">{expense.keterangan || '-'}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination controls */}
                  {filteredAllExpenses.length > expensesPerPage && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Menampilkan {(currentAllExpensesPage - 1) * expensesPerPage + 1} - {Math.min(currentAllExpensesPage * expensesPerPage, filteredAllExpenses.length)} dari {filteredAllExpenses.length} data
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentAllExpensesPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentAllExpensesPage === 1}
                          className={`px-3 py-1 rounded-md ${
                            currentAllExpensesPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          Sebelumnya
                        </button>
                        <div className="flex space-x-1">
                          {Array.from(
                            { length: Math.ceil(filteredAllExpenses.length / expensesPerPage) },
                            (_, i) => i + 1
                          ).map(number => (
                            <button
                              key={number}
                              onClick={() => setCurrentAllExpensesPage(number)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                                currentAllExpensesPage === number
                                  ? 'bg-[#59B997] text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              {number}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentAllExpensesPage(prev => 
                            Math.min(prev + 1, Math.ceil(filteredAllExpenses.length / expensesPerPage))
                          )}
                          disabled={currentAllExpensesPage >= Math.ceil(filteredAllExpenses.length / expensesPerPage)}
                          className={`px-3 py-1 rounded-md ${
                            currentAllExpensesPage >= Math.ceil(filteredAllExpenses.length / expensesPerPage)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          Berikutnya
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );

      default:
        return <div>Tab tidak tersedia</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <div className="relative z-20">
        <NavbarBaru />
      </div>
      
      {/* Main Content */}
      <div className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#59B997] to-[#3a9b7d] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Distribusi Dana dan Proyek</h1>
            <p className="text-xl opacity-90">
              Transparansi penggunaan dana untuk pembangunan masjid
            </p>
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-5 lg:px-15">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Statistik Donasi</h2>
              <p className="text-gray-600">
                Transparansi penggunaan dana donasi untuk pembangunan masjid
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59B997]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Total Donasi",
                    color: "green",
                    bg: "bg-green-100",
                    text: "text-green-600",
                    value: stats.totalDonation,
                    isCurrency: true,
                    desc: "Jumlah keseluruhan dana yang telah diterima",
                    iconPath: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ),
                  },
                  {
                    title: "Dana Dialokasikan",
                    color: "red",
                    bg: "bg-red-100",
                    text: "text-red-600",
                    value: stats.totalExpense,
                    isCurrency: true,
                    desc: "Dana yang telah digunakan untuk pembangunan",
                    iconPath: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    ),
                  },
                  {
                    title: "Dana Belum Dialokasikan",
                    color: "blue",
                    bg: "bg-blue-100",
                    text: "text-blue-600",
                    value: stats.balance,
                    isCurrency: true,
                    desc: "Dana yang masih tersedia untuk dialokasikan",
                    iconPath: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    ),
                  },
                  {
                    title: "Total Proyek",
                    color: "purple",
                    bg: "bg-purple-100",
                    text: "text-purple-600",
                    value: stats.totalProjects,
                    isCurrency: false,
                    desc: "Jumlah proyek pembangunan yang sedang berjalan",
                    iconPath: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    ),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white shadow-md rounded-xl p-6 border border-gray-100 flex flex-col justify-between min-h-[150px]"
                  >
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center mr-3`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-6 w-6 ${item.text}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {item.iconPath}
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold text-gray-700">
                        {item.title}
                      </h3>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800 truncate whitespace-nowrap overflow-hidden">
                        {item.isCurrency ? formatCurrency(item.value) : item.value}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="flex justify-center flex-wrap gap-y-2 md:gap-y-0 gap-x-6 md:gap-x-10 overflow-x-auto no-scrollbar py-3">
              {[
                { key: "daftar-proyek", label: "Daftar Proyek" },
                { key: "statistik-proyek", label: "Statistik Proyek" },
                { key: "project-expenses", label: "Riwayat Pengeluaran" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`${
                    activeTab === tab.key
                      ? "border-[#59B997] text-[#59B997]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } transition-all duration-200 border-b-2 font-medium text-sm px-4 py-2`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </div>
      </div>
      
      {/* Footer */}
      <SimpleFooter />
    </div>
  );
};

export default DistribusiDanaProyek;


