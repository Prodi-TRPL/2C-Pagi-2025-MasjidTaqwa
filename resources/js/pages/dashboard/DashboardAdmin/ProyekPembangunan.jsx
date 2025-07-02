import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ProyekPembangunan = () => {
  const [proyeks, setProyeks] = useState([]);
  const [selectedProyek, setSelectedProyek] = useState(null);
  const [pengeluarans, setPengeluarans] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);
  // Search/filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProyeks, setFilteredProyeks] = useState([]);
  // Sorting and filtering states
  const [sortOption, setSortOption] = useState('date-desc'); // Default: newest first
  const [statusFilter, setStatusFilter] = useState('all'); // Default: all projects
  // End of pagination states
  const [formProyek, setFormProyek] = useState({
    proyek_id: null,
    nama_item: '',
    deskripsi: '',
    target_dana: '',
  });
  // Display values for formatted inputs
  const [displayTargetDana, setDisplayTargetDana] = useState('');
  const [displayJumlah, setDisplayJumlah] = useState('');
  const [displayDetailJumlah, setDisplayDetailJumlah] = useState('');
  const [formFile, setFormFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [formPengeluaran, setFormPengeluaran] = useState({
    pengeluaran_id: null,
    nama_pengeluaran: '',
    jumlah: '',
    keterangan: '',
    kategori_pengeluaran_id: '',
  });
  const [filterPengeluaran, setFilterPengeluaran] = useState({
    kategori_pengeluaran_id: '',
  });
  const [activeTab, setActiveTab] = useState('proyek');
  const [showProyekForm, setShowProyekForm] = useState(false);
  const [stats, setStats] = useState({
    totalDonation: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [authError, setAuthError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success', // 'success', 'error', 'warning'
  });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false
  });
  const [warningModal, setWarningModal] = useState({
    show: false,
    title: '',
    message: ''
  });
  // State variables for in-page detail view
  const [detailLoading, setDetailLoading] = useState(false);
  const [proyekDetail, setProyekDetail] = useState(null);
  const [proyekPengeluarans, setProyekPengeluarans] = useState([]);
  const [detailStats, setDetailStats] = useState({
    totalPengeluaran: 0,
    sisaDana: 0,
    persentasePengeluaran: 0,
    targetDana: 0,
  });
  // Pagination for project expenses
  const [currentPengeluaranPage, setCurrentPengeluaranPage] = useState(1);
  const [pengeluaranPerPage] = useState(5);
  // Filtering and sorting for project expenses
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('');
  const [expenseSortOption, setExpenseSortOption] = useState('date-desc'); // Default: newest first
  const [filteredProyekPengeluarans, setFilteredProyekPengeluarans] = useState([]);
  // State for the pengeluaran form in detail section
  const [showPengeluaranForm, setShowPengeluaranForm] = useState(false);
  const [detailFormPengeluaran, setDetailFormPengeluaran] = useState({
    pengeluaran_id: null,
    nama_pengeluaran: '',
    jumlah: '',
    keterangan: '',
    kategori_pengeluaran_id: '',
  });
  // Ref for scrolling to detail section
  const detailSectionRef = useRef(null);
  const [modalImage, setModalImage] = useState(null);
  // Add missing state variable for total pengeluaran
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [filteredPengeluarans, setFilteredPengeluarans] = useState([]);
  // Add a state variable to track all expenses for all projects
  const [allProyekPengeluarans, setAllProyekPengeluarans] = useState({});

  const navigate = useNavigate();

  // Add a function to show toast notifications
  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
    
    // When showing a success toast for adding/updating expense, ensure sorting is by newest first
    if (type === 'success' && (message.includes('ditambahkan') || message.includes('diperbarui'))) {
      setExpenseSortOption('date-desc');
      setCurrentPengeluaranPage(1); // Return to first page
    }
  };

  // Add a function to show confirmation modal instead of browser alerts
  const showConfirmation = (title, message, onConfirm) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm,
      isLoading: false
    });
  };
  
  // Add a function to show blocking warning modal (no action buttons except "OK")
  const showWarning = (title, message) => {
    setWarningModal({
      show: true,
      title,
      message
    });
  };

  // Helper function to get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthError('Sesi login tidak ditemukan. Silakan login kembali.');
      showToast('Sesi login tidak ditemukan. Silakan login kembali.', 'error');
      return null;
    }
    return {
      Authorization: `Bearer ${token}`
    };
  };

  // Function to fetch project details for in-page display
  const fetchProyekDetail = async (id) => {
    try {
      setDetailLoading(true);
      
      // Close the edit form if it's open
      if (showProyekForm) {
        setShowProyekForm(false);
        clearFormProyek();
      }
      
      const headers = getAuthHeaders();
      if (!headers) {
        setDetailLoading(false);
        return;
      }
      
      // Fetch the project details
      const response = await axios.get(`/api/ProyekPembangunan/${id}`, { headers });
      
      // Preserve raw numeric values in the project data
      const proyekData = response.data;
      const enhancedData = {
        ...proyekData,
        target_dana: proyekData.target_dana, // Keep as is
        dana_terkumpul: proyekData.dana_terkumpul // Keep as is
      };
      
      setProyekDetail(enhancedData);
      
      // Calculate stats - use parseFloat only for calculations, not for storage
      const totalPengeluaran = proyekData.pengeluaran?.reduce((sum, p) => {
        // Parse jumlah safely for calculation
        const amount = typeof p.jumlah === 'string' ? 
          parseFloat(p.jumlah.replace(/[^\d.-]/g, '')) : 
          parseFloat(p.jumlah) || 0;
        return sum + amount;
      }, 0) || 0;
      
      const targetDana = typeof proyekData.target_dana === 'string' ?
        parseFloat(proyekData.target_dana.replace(/[^\d.-]/g, '')) :
        parseFloat(proyekData.target_dana) || 0;
      
      // Saldo is the remaining balance from global stats
      const sisaDana = stats.balance;
      
      // Calculate percentage of expenses relative to target_dana
      const persentasePengeluaran = targetDana ? 
        Math.min(100, Math.round((totalPengeluaran / targetDana) * 100)) : 0;
      
      setDetailStats({
        totalPengeluaran,
        sisaDana,
        persentasePengeluaran,
        targetDana
      });
      
      // Get pengeluarans
      if (proyekData.pengeluaran) {
        // Preserve raw jumlah values in the pengeluaran data
        const pengeluaranWithRawValues = proyekData.pengeluaran.map(p => ({
          ...p,
          jumlah: p.jumlah // Keep as is
        }));
        setProyekPengeluarans(pengeluaranWithRawValues);
        // Reset to first page when loading new expense data
        setCurrentPengeluaranPage(1);
        // Ensure default sort is by newest first
        setExpenseSortOption('date-desc');
      } else {
        await fetchDetailPengeluarans(id);
      }
      
      setAuthError(null);
      
      // Scroll to detail section after a short delay to ensure rendering
      setTimeout(() => {
        if (detailSectionRef.current) {
          detailSectionRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
      
    } catch (error) {
      console.error('Error fetching project details:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      } else {
        showToast('Gagal memuat detail proyek', 'error');
      }
    } finally {
      setDetailLoading(false);
    }
  };
  
  // Function to fetch pengeluarans for detail modal if not included in project response
  const fetchDetailPengeluarans = async (proyekId) => {
    if (!proyekId) return;
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await axios.get(`/api/Pengeluaran`, {
        params: { proyek_id: proyekId },
        headers
      });
      
      // Preserve raw numeric values
      const pengeluaransData = (response.data.data || response.data).map(p => ({
        ...p,
        jumlah: p.jumlah // Keep as is
      }));
      
      setProyekPengeluarans(pengeluaransData);
      // Reset to first page when loading new expense data
      setCurrentPengeluaranPage(1);
      // Ensure default sort is by newest first
      setExpenseSortOption('date-desc');
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching detail expenses:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
      } else {
        showToast('Gagal mengambil data pengeluaran', 'error');
      }
    }
  };
  
  // Function to clear the detail form
  const clearDetailForm = () => {
    setDetailFormPengeluaran({
      pengeluaran_id: null,
      nama_pengeluaran: '',
      jumlah: '',
      keterangan: '',
      kategori_pengeluaran_id: '',
    });
    setDisplayDetailJumlah('');
    
    // Ensure the default sort is by date (newest first)
    setExpenseSortOption('date-desc');
  };
  
  // Function to clear detail view
  const clearDetailView = () => {
    setSelectedProyek(null);
    setProyekDetail(null);
    setProyekPengeluarans([]);
    setShowPengeluaranForm(false);
    clearDetailForm();
    setCurrentPengeluaranPage(1); // Reset pagination when clearing view
    setExpenseSortOption('date-desc'); // Reset sort to default
    setExpenseSearchTerm(''); // Clear search
    setExpenseCategoryFilter(''); // Clear category filter
  };
  
  // Function to handle form changes in detail modal
  const handleDetailFormChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for jumlah field to format with thousand separators
    if (name === 'jumlah') {
      // First, get the cursor position
      const cursorPosition = e.target.selectionStart;
      
      // Count dots before the cursor
      const dotsBeforeCursor = (value.substring(0, cursorPosition).match(/\./g) || []).length;
      
      // Remove existing formatting
      const unformattedValue = unformatCurrency(value);
      
      // Store the raw unformatted string value
      setDetailFormPengeluaran(prev => ({ ...prev, [name]: unformattedValue }));
      
      // Format for display
      const formattedValue = formatCurrency(unformattedValue);
      
      // Update display value
      setDisplayDetailJumlah(formattedValue);
      
      // Update the input value directly for proper formatting
      e.target.value = formattedValue;
      
      // Restore cursor position after React updates the input
      setTimeout(() => {
        // Count dots before cursor in the new formatted value
        const newDotsBeforeCursor = (formattedValue.substring(0, cursorPosition).match(/\./g) || []).length;
        // Adjust cursor position based on the difference in dots
        const newCursorPosition = cursorPosition + (newDotsBeforeCursor - dotsBeforeCursor);
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    } else {
      setDetailFormPengeluaran(prev => ({ ...prev, [name]: value }));
    }
  };

  // Function to handle submit pengeluaran in detail modal
  const handleSubmitDetailPengeluaran = async () => {
    const { nama_pengeluaran, jumlah, kategori_pengeluaran_id, pengeluaran_id } = detailFormPengeluaran;
    if (!nama_pengeluaran || !jumlah || !kategori_pengeluaran_id) {
      showToast('Harap isi semua kolom pengeluaran yang wajib', 'error');
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      // Parse the jumlah to ensure it's a valid number for the backend
      const parsedJumlah = parseFloat(jumlah);
      if (isNaN(parsedJumlah)) {
        showToast('Jumlah pengeluaran tidak valid', 'error');
        return;
      }

      // Check if the saldo is sufficient
      if (parsedJumlah > stats.balance) {
        showToast('Saldo tidak mencukupi untuk pengeluaran ini', 'error');
        return;
      }
      
      // Calculate total existing expenses for this project
      const existingTotal = proyekPengeluarans.reduce((sum, p) => {
        // Skip the expense being edited if it exists
        if (pengeluaran_id && p.pengeluaran_id === pengeluaran_id) return sum;
        const amount = typeof p.jumlah === 'string' ? 
          parseFloat(p.jumlah.replace(/[^\d.-]/g, '')) : 
          parseFloat(p.jumlah) || 0;
        return sum + amount;
      }, 0);
      
      // Calculate the target amount
      const targetAmount = parseFloat(proyekDetail.target_dana);
      
      // Check if adding this expense would exceed the target
      if (existingTotal + parsedJumlah > targetAmount) {
        // Use blocking warning instead of confirmation
        showWarning(
          'Peringatan: Target Terlampaui',
          'Dana terkumpul akan melebihi target proyek. Pengeluaran ini tidak dapat diproses.'
        );
        return;
      }
      
      // If everything is valid, submit the expense
      await submitPengeluaran(parsedJumlah);
      
    } catch (error) {
      console.error('Error submitting expense:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      } else {
        showToast('Gagal menyimpan pengeluaran', 'error');
      }
    }
  };

  // Function to handle edit pengeluaran in detail modal
  const handleEditDetailPengeluaran = (p) => {
    setDetailFormPengeluaran({
      pengeluaran_id: p.pengeluaran_id,
      nama_pengeluaran: p.nama_pengeluaran,
      jumlah: p.jumlah?.toString() || '',
      keterangan: p.keterangan || '',
      kategori_pengeluaran_id: p.kategori_pengeluaran_id,
    });
    // Set formatted display value
    setDisplayDetailJumlah(formatCurrency(p.jumlah));
    setShowPengeluaranForm(true);
  };

  // Function to handle delete pengeluaran in detail modal
  const handleDeleteDetailPengeluaran = (id) => {
    showConfirmation(
      'Hapus Pengeluaran',
      'Apakah Anda yakin ingin menghapus pengeluaran ini?',
      async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isLoading: true }));
          
          const headers = getAuthHeaders();
          if (!headers) {
            setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
            return;
          }
          
          await axios.delete(`/api/Pengeluaran/${id}`, { headers });
          
          // Close confirmation modal
          setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
          
          // Show success message
          showToast('Pengeluaran berhasil dihapus');
          
          // Refresh data
          await fetchStats(); // Refresh global stats
          await fetchProyekDetail(proyekDetail.proyek_id); // Refresh project details
          
          setAuthError(null);
        } catch (error) {
          console.error('Error deleting expense:', error);
          setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
          
          if (error.response && error.response.status === 401) {
            setAuthError('Sesi login telah berakhir. Silakan login kembali.');
            showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
          } else {
            showToast('Gagal menghapus pengeluaran', 'error');
          }
        }
      }
    );
  };

  // Data fetching functions
  const fetchProyeks = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const res = await axios.get('/api/ProyekPembangunan', { headers });
      const proyeksData = res.data.data || res.data;
      
      // Make sure to preserve the raw values
      const data = proyeksData.map(p => ({
        ...p,
        target_dana: p.target_dana, // Keep as is, don't convert to number
        dana_terkumpul: p.dana_terkumpul // Keep as is, don't convert to number
      }));
      
      setProyeks(data);
      setFilteredProyeks(data);
      
      // After fetching projects, fetch expenses for each project
      const expensesPerProject = {};
      
      // Fetch expenses for all projects
      const allExpensesRes = await axios.get('/api/Pengeluaran', { headers });
      const allExpenses = allExpensesRes.data.data || allExpensesRes.data || [];
      
      // Group expenses by project
      data.forEach(project => {
        expensesPerProject[project.proyek_id] = allExpenses.filter(
          expense => expense.proyek_id === project.proyek_id
        );
      });
      
      setAllProyekPengeluarans(expensesPerProject);
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      } else {
        showToast('Gagal mengambil data proyek pembangunan', 'error');
      }
    }
  };

  const fetchKategoris = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const res = await axios.get('/api/KategoriPengeluaran', { headers });
      console.log('Fetched kategori data:', res.data);
      setKategoris(res.data.data || res.data);
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      } else {
        showToast('Gagal mengambil data kategori pengeluaran', 'error');
      }
    }
  };

  const fetchPengeluarans = async (proyekId) => {
    if (!proyekId) {
      setPengeluarans([]);
      return;
    }
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const params = { proyek_id: proyekId };
      if (filterPengeluaran.kategori_pengeluaran_id) {
        params.kategori_pengeluaran_id = filterPengeluaran.kategori_pengeluaran_id;
      }
      
      const res = await axios.get('/api/Pengeluaran', { 
        params,
        headers
      });
      
      // Preserve raw values for jumlah field
      const pengeluaransData = (res.data.data || res.data).map(p => ({
        ...p,
        jumlah: p.jumlah // Keep as is, don't convert to number
      }));
      
      setPengeluarans(pengeluaransData);
      
      const total = pengeluaransData.reduce((sum, p) => {
        // Use parseFloat here just for the calculation, not for storage
        const amount = typeof p.jumlah === 'string' ? 
          parseFloat(p.jumlah.replace(/[^\d.-]/g, '')) : 
          parseFloat(p.jumlah) || 0;
          
        return sum + amount;
      }, 0);
      
      setTotalPengeluaran(total);
      setFilteredPengeluarans(pengeluaransData);
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      } else {
        showToast('Gagal mengambil data pengeluaran', 'error');
      }
    }
  };

  const fetchStats = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      // Fetch donation total
      const donationRes = await axios.get('/api/donations', { headers });
      const donations = donationRes.data || [];
      const totalDonation = donations
        .filter(d => d.status === 'Diterima')
        .reduce((sum, donation) => sum + parseInt(donation.jumlah || 0), 0);
      
      // Fetch expense total
      const expenseRes = await axios.get('/api/Pengeluaran', { headers });
      const expenses = expenseRes.data.data || expenseRes.data || [];
      const totalExpense = expenses.reduce((sum, expense) => sum + parseInt(expense.jumlah || 0), 0);
      
      // Calculate balance
      const balance = totalDonation - totalExpense;
      
      setStats({
        totalDonation,
        totalExpense,
        balance
      });
      setAuthError(null);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
      }
    }
  };

  useEffect(() => {
    fetchProyeks();
    fetchKategoris();
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedProyek) {
      fetchPengeluarans(selectedProyek.proyek_id);
    } else {
      setPengeluarans([]);
    }
  }, [selectedProyek, filterPengeluaran]);

  // Filter and sort projects based on search term, status filter, and sort option
  useEffect(() => {
    // First, apply search filter
    let filtered = [...proyeks];
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(p => 
        p.nama_item.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.deskripsi && p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Then, apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => {
        const progress = hitungProgress(p.dana_terkumpul, p.target_dana);
        if (statusFilter === 'completed') {
          return progress >= 100;
        } else if (statusFilter === 'in-progress') {
          return progress < 100;
        }
        return true;
      });
    }
    
    // Finally, apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc': // Newest first
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date-asc': // Oldest first
          return new Date(a.created_at) - new Date(b.created_at);
        case 'title-asc': // A-Z
          return a.nama_item.localeCompare(b.nama_item);
        case 'title-desc': // Z-A
          return b.nama_item.localeCompare(a.nama_item);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    
    setFilteredProyeks(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, proyeks, sortOption, statusFilter]);

  // Helper function for formatting currency with Indonesian format
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    
    // Convert to string and remove any existing formatting
    let numStr = String(value).replace(/[^\d.-]/g, '');
    
    // Handle empty string after cleaning
    if (numStr === '' || numStr === '.') return '';
    
    // Parse as float and format
    const num = parseFloat(numStr);
    if (isNaN(num)) return '';
    
    // Convert to string with proper formatting
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Helper function to unformat the currency to get the numeric value
  const unformatCurrency = (value) => {
    if (!value && value !== 0) return '';
    
    // Remove thousand separators but keep decimal point
    return String(value).replace(/\./g, '');
  };

  // Form handlers for the main form
  const handleFormProyekChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for target_dana field to format with thousand separators
    if (name === 'target_dana') {
      // First, get the cursor position
      const cursorPosition = e.target.selectionStart;
      
      // Count dots before the cursor
      const dotsBeforeCursor = (value.substring(0, cursorPosition).match(/\./g) || []).length;
      
      // Remove existing formatting
      const unformattedValue = unformatCurrency(value);
      
      // Store the raw unformatted string value in the form state
      setFormProyek(prev => ({ ...prev, [name]: unformattedValue }));
      
      // Format for display
      const formattedValue = formatCurrency(unformattedValue);
      setDisplayTargetDana(formattedValue);
      
      // Restore cursor position after React updates the input
      setTimeout(() => {
        const input = document.querySelector(`input[name="${name}"]`);
        if (input) {
          // Count dots before cursor in the new formatted value
          const newDotsBeforeCursor = (formattedValue.substring(0, cursorPosition).match(/\./g) || []).length;
          // Adjust cursor position based on the difference in dots
          const newCursorPosition = cursorPosition + (newDotsBeforeCursor - dotsBeforeCursor);
          input.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      setFormProyek(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormPengeluaranChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for jumlah field to format with thousand separators
    if (name === 'jumlah') {
      // First, get the cursor position
      const cursorPosition = e.target.selectionStart;
      
      // Count dots before the cursor
      const dotsBeforeCursor = (value.substring(0, cursorPosition).match(/\./g) || []).length;
      
      // Remove existing formatting
      const unformattedValue = unformatCurrency(value);
      
      // Store the raw unformatted string value in the form state
      setFormPengeluaran(prev => ({ ...prev, [name]: unformattedValue }));
      
      // Format for display
      const formattedValue = formatCurrency(unformattedValue);
      setDisplayJumlah(formattedValue);
      
      // Restore cursor position after React updates the input
      setTimeout(() => {
        const input = document.querySelector(`input[name="${name}"]`);
        if (input) {
          // Count dots before cursor in the new formatted value
          const newDotsBeforeCursor = (formattedValue.substring(0, cursorPosition).match(/\./g) || []).length;
          // Adjust cursor position based on the difference in dots
          const newCursorPosition = cursorPosition + (newDotsBeforeCursor - dotsBeforeCursor);
          input.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      setFormPengeluaran(prev => ({ ...prev, [name]: value }));
    }
  };

  // Clear forms
  const clearFormProyek = () => {
    setFormProyek({
      proyek_id: null,
      nama_item: '',
      deskripsi: '',
      target_dana: '',
    });
    setDisplayTargetDana('');
    setPreviewImage(null);
    setFormFile(null);
  };

  const clearFormPengeluaran = () => {
    setFormPengeluaran({
      pengeluaran_id: null,
      nama_pengeluaran: '',
      jumlah: '',
      keterangan: '',
      kategori_pengeluaran_id: '',
    });
    setDisplayJumlah('');
  };

  // Handle submit proyek form
  const handleSubmitProyek = async () => {
    const { nama_item, deskripsi, target_dana, proyek_id } = formProyek;
    if (!nama_item || !deskripsi || !target_dana) {
      showToast('Harap isi semua kolom proyek yang wajib', 'error');
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('nama_item', nama_item);
      formData.append('deskripsi', deskripsi);
      
      // Parse the target_dana to ensure it's a valid number for the backend
      const parsedTargetDana = parseFloat(target_dana);
      if (isNaN(parsedTargetDana)) {
        showToast('Target dana harus berupa angka yang valid', 'error');
        return;
      }
      formData.append('target_dana', parsedTargetDana);
      
      if (formFile) {
        formData.append('gambar', formFile);
      }

      if (proyek_id) {
        // Update existing project
        formData.append('_method', 'PUT'); // Laravel method spoofing
        await axios.post(`/api/ProyekPembangunan/${proyek_id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...headers
          },
        });
        showToast('Proyek berhasil diperbarui', 'success');
      } else {
        // Create new project
        await axios.post('/api/ProyekPembangunan', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...headers
          },
        });
        showToast('Proyek baru berhasil ditambahkan', 'success');
      }
      clearFormProyek();
      fetchProyeks();
      setShowProyekForm(false);
      setAuthError(null);
    } catch (error) {
      console.error('Error saving project:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      } else {
        showToast(`Gagal menyimpan data proyek: ${error.response?.data?.message || error.message}`, 'error');
      }
    }
  };

  const handleEditProyek = (p) => {
    // Close detail view if it's open
    if (selectedProyek && selectedProyek.proyek_id === p.proyek_id) {
      setSelectedProyek(null);
    }
    
    setFormProyek({
      proyek_id: p.proyek_id,
      nama_item: p.nama_item,
      deskripsi: p.deskripsi,
      target_dana: p.target_dana?.toString() || '',
    });
    
    // Set formatted display value for target_dana
    setDisplayTargetDana(formatCurrency(p.target_dana));
    
    // Set preview image if project has an image
    if (p.gambar) {
      setPreviewImage(`/storage/${p.gambar}`);
    } else {
      setPreviewImage(null);
    }
    
    setFormFile(null); // Reset file input on edit
    setActiveTab('proyek');
    setShowProyekForm(true);
    
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.querySelector('.proyek-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDeleteProyek = async (id) => {
    showConfirmation(
      'Hapus Proyek',
      'Apakah Anda yakin ingin menghapus proyek ini?',
      async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const headers = getAuthHeaders();
          if (!headers) {
            setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
            return;
          }

          await axios.delete(`/api/ProyekPembangunan/${id}`, { headers });
          if (selectedProyek && selectedProyek.proyek_id === id) {
            setSelectedProyek(null);
          }
          fetchProyeks();
          setAuthError(null);
          showToast('Proyek berhasil dihapus', 'success');
          setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
        } catch (error) {
          console.error('Error deleting project:', error);
          if (error.response && error.response.status === 401) {
            setAuthError('Sesi login telah berakhir. Silakan login kembali.');
            showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
          } else {
            showToast('Gagal menghapus proyek', 'error');
          }
          setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
        }
      }
    );
  };

  const handleSubmitPengeluaran = async () => {
    const { nama_pengeluaran, jumlah, kategori_pengeluaran_id, pengeluaran_id } = formPengeluaran;
    if (!nama_pengeluaran || !jumlah || !kategori_pengeluaran_id) {
      showToast('Harap isi semua kolom pengeluaran yang wajib', 'error');
      return;
    }
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      // Parse the jumlah to ensure it's a valid number for the backend
      const parsedJumlah = parseFloat(jumlah);
      if (isNaN(parsedJumlah)) {
        showToast('Jumlah harus berupa angka yang valid', 'error');
        return;
      }
      
      // Calculate total existing expenses for this project
      const projectExpenses = allProyekPengeluarans[selectedProyek.proyek_id] || [];
      const existingTotal = projectExpenses.reduce((sum, p) => {
        // Skip the expense being edited if it exists
        if (pengeluaran_id && p.pengeluaran_id === pengeluaran_id) return sum;
        const amount = typeof p.jumlah === 'string' ? 
          parseFloat(p.jumlah.replace(/[^\d.-]/g, '')) : 
          parseFloat(p.jumlah) || 0;
        return sum + amount;
      }, 0);
      
      // Calculate the target amount
      const targetAmount = parseFloat(selectedProyek.target_dana);
      
      // Check if adding this expense would exceed the target
      if (existingTotal + parsedJumlah > targetAmount) {
        // Use blocking warning instead of confirmation
        showWarning(
          'Peringatan: Target Terlampaui',
          'Dana terkumpul akan melebihi target proyek. Pengeluaran ini tidak dapat diproses.'
        );
        return;
      }

      await submitMainPengeluaran(parsedJumlah);
      
    } catch (error) {
      console.error('Error saving expense:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      } else {
        showToast('Gagal menyimpan data pengeluaran', 'error');
      }
    }
  };
  
  // Add a new function to check and update project status
  const checkAndUpdateProjectStatus = async (proyekId, totalExpenses, targetDana) => {
    try {
      // Check if the total expenses exactly match the target amount (with a small tolerance for floating point precision)
      const isExactMatch = Math.abs(totalExpenses - targetDana) < 0.01;
      
      if (isExactMatch) {
        // Get the current project data
        const headers = getAuthHeaders();
        if (!headers) return;
        
        const response = await axios.get(`/api/ProyekPembangunan/${proyekId}`, { headers });
        const currentProject = response.data;
        
        // Show success message
        showToast('Target dana proyek telah tercapai!', 'success');
        
        // Refresh the project list to update the status badges
        await fetchProyeks();
      }
    } catch (error) {
      console.error('Error checking project status:', error);
    }
  };

  // Add a new refreshProjectStats function to centralize data refreshing
  const refreshProjectStats = async (proyekId) => {
    try {
      // Show a subtle loading indicator
      setDetailLoading(true);
      
      // Refresh all relevant data
      await fetchStats(); // Refresh global stats
      
      if (proyekId) {
        await fetchProyekDetail(proyekId); // Refresh project details
      }
      
      await fetchProyeks(); // Refresh all projects data
      
      // If we're in the expenses tab, refresh the expenses list
      if (selectedProyek) {
        fetchPengeluarans(selectedProyek.proyek_id);
      }
      
      setAuthError(null);
    } catch (error) {
      console.error('Error refreshing project stats:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  // Modify the submitMainPengeluaran function to use the new refreshProjectStats function
  const submitMainPengeluaran = async (parsedJumlah) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    const { nama_pengeluaran, kategori_pengeluaran_id, pengeluaran_id, keterangan } = formPengeluaran;

      const submitForm = {
        ...formPengeluaran,
        jumlah: parsedJumlah,
        proyek_id: selectedProyek.proyek_id,
      };
    
      if (pengeluaran_id) {
        await axios.put(`/api/Pengeluaran/${pengeluaran_id}`, submitForm, { headers });
        showToast('Pengeluaran berhasil diperbarui', 'success');
      } else {
        await axios.post('/api/Pengeluaran', submitForm, { headers });
        showToast('Pengeluaran berhasil ditambahkan', 'success');
      }
    
      clearFormPengeluaran();
    
    // Use the centralized refresh function
    await refreshProjectStats(selectedProyek.proyek_id);
    
    // Calculate new total expenses after adding/updating this expense
    const projectExpenses = await axios.get('/api/Pengeluaran', { 
      params: { proyek_id: selectedProyek.proyek_id },
      headers 
    });
    const expenses = projectExpenses.data.data || projectExpenses.data || [];
    const totalExpenses = expenses.reduce((sum, p) => {
      const amount = typeof p.jumlah === 'string' ? 
        parseFloat(p.jumlah.replace(/[^\d.-]/g, '')) : 
        parseFloat(p.jumlah) || 0;
      return sum + amount;
    }, 0);
    
    // Check if status needs to be updated
    await checkAndUpdateProjectStatus(
      selectedProyek.proyek_id, 
      totalExpenses, 
      parseFloat(selectedProyek.target_dana)
    );
    
      setAuthError(null);
  };

  const handleEditPengeluaran = (p) => {
    setFormPengeluaran({
      pengeluaran_id: p.pengeluaran_id,
      nama_pengeluaran: p.nama_pengeluaran,
      jumlah: p.jumlah?.toString() || '',
      keterangan: p.keterangan || '',
      kategori_pengeluaran_id: p.kategori_pengeluaran_id,
      
    });
    
    // Set formatted display value for jumlah
    setDisplayJumlah(formatCurrency(p.jumlah));
    
    setActiveTab('pengeluaran');
  };

  // Modify the handleDeletePengeluaran function to use refreshProjectStats
  const handleDeletePengeluaran = async (id) => {
    showConfirmation(
      'Hapus Pengeluaran',
      'Apakah Anda yakin ingin menghapus pengeluaran ini?',
      async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const headers = getAuthHeaders();
          if (!headers) {
            setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
            return;
          }

          await axios.delete(`/api/Pengeluaran/${id}`, { headers });
          
          // Use the centralized refresh function
          await refreshProjectStats(selectedProyek.proyek_id);
          
          setAuthError(null);
          showToast('Pengeluaran berhasil dihapus', 'success');
          setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
        } catch (error) {
          console.error('Error deleting expense:', error);
          if (error.response && error.response.status === 401) {
            setAuthError('Sesi login telah berakhir. Silakan login kembali.');
            showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
          } else {
            showToast('Gagal menghapus pengeluaran', 'error');
          }
          setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
        }
      }
    );
  };

  // Helper functions
  const hitungProgress = (proyek) => {
    if (!proyek || !proyek.target_dana || parseFloat(proyek.target_dana) === 0) return 0;
    
    // Get all expenses for this project from the pre-fetched expenses
    const projectExpenses = allProyekPengeluarans[proyek.proyek_id] || [];
    
    // Calculate total expenses
    const totalPengeluaran = projectExpenses.reduce((sum, p) => {
      const amount = typeof p.jumlah === 'string' ? 
        parseFloat(p.jumlah.replace(/[^\d.-]/g, '')) : 
        parseFloat(p.jumlah) || 0;
      return sum + amount;
    }, 0);
    
    // Calculate progress percentage
    const targetDana = parseFloat(proyek.target_dana);
    return Math.min(100, Math.round((totalPengeluaran / targetDana) * 100));
  };

  const handleOpenImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setModalImage(null);
    setShowImageModal(false);
  };

  // Handle login redirect
  const handleLogin = () => {
    window.location.href = '/login';
  };

  // Add a helper function for getting category name
  const getCategoryName = (categoryId) => {
    if (!categoryId) return '';
    
    const category = kategoris.find(k => 
      (k.kategori_pengeluaran_id && k.kategori_pengeluaran_id.toString() === categoryId.toString()) || 
      (k.id && k.id.toString() === categoryId.toString())
    );
    
    return category ? category.nama_kategori : '';
  };

  // Handle project click - selects a project and shows its details
  const handleProyekClick = (p, e) => {
    // Ignore if clicking on a button inside the project card
    if (e.target.tagName === 'BUTTON' || 
        e.target.closest('button') || 
        e.target.tagName === 'A' || 
        e.target.closest('a')) {
      return;
    }
    
    // Close edit form if it's open
    if (showProyekForm) {
      setShowProyekForm(false);
      clearFormProyek();
    }
    
    // Toggle detail view
    if (selectedProyek && selectedProyek.proyek_id === p.proyek_id) {
      clearDetailView();
    } else {
      // Fetch the latest stats first
      fetchStats().then(() => {
        // Then set the selected project and fetch its details
        setSelectedProyek(p);
        fetchProyekDetail(p.proyek_id);
        
        // Scroll to detail section after a short delay to ensure rendering
        setTimeout(() => {
          if (detailSectionRef.current) {
            detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      });
    }
  };

  // Pagination calculation
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProyeks.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProyeks.length / projectsPerPage);
  
  // Filter and sort project expenses
  useEffect(() => {
    if (!proyekPengeluarans.length) {
      setFilteredProyekPengeluarans([]);
      return;
    }
    
    let filtered = [...proyekPengeluarans];
    
    // Apply search filter
    if (expenseSearchTerm.trim() !== '') {
      filtered = filtered.filter(p => 
        p.nama_pengeluaran.toLowerCase().includes(expenseSearchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (expenseCategoryFilter) {
      filtered = filtered.filter(p => 
        p.kategori_pengeluaran_id.toString() === expenseCategoryFilter.toString()
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
    
    setFilteredProyekPengeluarans(filtered);
    // Reset to first page when filters change
    setCurrentPengeluaranPage(1);
  }, [proyekPengeluarans, expenseSearchTerm, expenseCategoryFilter, expenseSortOption]);

  // Function to change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to top of projects list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToast('Ukuran file terlalu besar. Maksimal 1MB.', 'error');
        e.target.value = null;
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showToast('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.', 'error');
        e.target.value = null;
        return;
      }
      
      setFormFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Format date to Indonesian format with Asia/Jakarta timezone
  const formatDate = (dateString) => {
    // Check if dateString is null, undefined, or empty
    if (!dateString) {
      return '-';
    }
    
    try {
      // Create date object from the UTC date string
      const utcDate = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(utcDate.getTime())) {
        console.warn(`Invalid date value: ${dateString}`);
        return '-';
      }
      
      // Format options for Indonesia locale with explicit timezone
      const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
      };
      
      // Format the date with the Indonesia locale and Asia/Jakarta timezone
      return new Intl.DateTimeFormat('id-ID', options).format(utcDate);
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return '-';
    }
  };

  // Handle detail button click - opens the detail view for a project
  const handleDetailButtonClick = (e, p) => {
    e.stopPropagation();
    
    // Close edit form if it's open
    if (showProyekForm) {
      setShowProyekForm(false);
      clearFormProyek();
    }
    
    // Toggle detail view
    if (selectedProyek && selectedProyek.proyek_id === p.proyek_id) {
      clearDetailView();
    } else {
      // Fetch the latest stats first
      fetchStats().then(() => {
        // Then set the selected project and fetch its details
        setSelectedProyek(p);
        fetchProyekDetail(p.proyek_id);
        
        // Scroll to detail section after a short delay to ensure rendering
        setTimeout(() => {
          if (detailSectionRef.current) {
            detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      });
    }
  };

  // Modify the getTotalExpenses function for the project card
  const getTotalExpenses = (proyekId) => {
    const projectExpenses = allProyekPengeluarans[proyekId] || [];
    return projectExpenses.reduce((sum, expense) => {
      const amount = typeof expense.jumlah === 'string' ? 
        parseFloat(expense.jumlah.replace(/[^\d.-]/g, '')) : 
        parseFloat(expense.jumlah) || 0;
      return sum + amount;
    }, 0);
  };

  // Add helper function to submit the expense (extracted from handleSubmitDetailPengeluaran)
  const submitPengeluaran = async (parsedJumlah) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    const { nama_pengeluaran, kategori_pengeluaran_id, pengeluaran_id, keterangan } = detailFormPengeluaran;
    
    // Prepare the data for the API
    const pengeluaranData = {
      nama_pengeluaran,
      jumlah: parsedJumlah,
      kategori_pengeluaran_id,
      proyek_id: proyekDetail.proyek_id,
      keterangan
    };
    
    let response;
    if (pengeluaran_id) {
      // Update existing pengeluaran
      response = await axios.put(`/api/Pengeluaran/${pengeluaran_id}`, pengeluaranData, { headers });
      showToast('Pengeluaran berhasil diperbarui', 'success');
    } else {
      // Create new pengeluaran
      response = await axios.post('/api/Pengeluaran', pengeluaranData, { headers });
      showToast('Pengeluaran berhasil ditambahkan', 'success');
    }
    
    // Clear form and close it
    clearDetailForm();
    setShowPengeluaranForm(false);
    
    // Use the centralized refresh function
    await refreshProjectStats(proyekDetail.proyek_id);
    
    // Calculate new total expenses after adding/updating this expense
    const projectExpenses = await axios.get('/api/Pengeluaran', { 
      params: { proyek_id: proyekDetail.proyek_id },
      headers 
    });
    const expenses = projectExpenses.data.data || projectExpenses.data || [];
    const totalExpenses = expenses.reduce((sum, p) => {
      const amount = typeof p.jumlah === 'string' ? 
        parseFloat(p.jumlah.replace(/[^\d.-]/g, '')) : 
        parseFloat(p.jumlah) || 0;
      return sum + amount;
    }, 0);
    
    // Check if status needs to be updated
    await checkAndUpdateProjectStatus(
      proyekDetail.proyek_id, 
      totalExpenses, 
      parseFloat(proyekDetail.target_dana)
    );
    
    setAuthError(null);
    return response.data;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center ${
              toast.type === 'success'
                ? 'bg-[#59B997] text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-500 text-white'
            }`}
          >
            <div className="mr-3">
              {toast.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : toast.type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => !confirmModal.isLoading && setConfirmModal(prev => ({ ...prev, show: false }))}
              style={{ zIndex: 40 }}
            ></motion.div>
            
            {/* Modal Content */}
            <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center relative z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-50"
              >
                <h3 className="text-lg font-medium leading-6 text-gray-900">{confirmModal.title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{confirmModal.message}</p>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                    onClick={() => !confirmModal.isLoading && setConfirmModal(prev => ({ ...prev, show: false }))}
                    disabled={confirmModal.isLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none ${confirmModal.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={confirmModal.onConfirm}
                    disabled={confirmModal.isLoading}
                  >
                    {confirmModal.isLoading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    Hapus
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Modal - Blocking warning with only OK button */}
      <AnimatePresence>
        {warningModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              style={{ zIndex: 40 }}
            ></motion.div>
            
            {/* Modal Content */}
            <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center relative z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-50"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">{warningModal.title}</h3>
                </div>
                
                <div className="mt-2 mb-6">
                  <p className="text-sm text-gray-500">{warningModal.message}</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none"
                    onClick={() => setWarningModal(prev => ({ ...prev, show: false }))}
                  >
                    OK
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#59B997] to-[#3a9b7d] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Proyek Pembangunan</h1>
              <p className="text-green-100 opacity-90 mt-1">Kelola proyek pembangunan dan pengeluaran terkait</p>
            </div>
            <div className="flex space-x-2">
              {selectedProyek && (
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'pengeluaran' ? 'bg-white text-[#59B997]' : 'bg-white/10 hover:bg-white/20'}`}
                  onClick={() => setActiveTab('pengeluaran')}
                >
                  Pengeluaran
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Error Alert */}
      {authError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
            <button 
              onClick={handleLogin}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Donation Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Donasi</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalDonation)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Expense Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Balance Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Saldo</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.balance)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Proyek Tab */}
        {activeTab === 'proyek' && (
          <div className="space-y-8">
            {/* Add Project Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                Manajemen Proyek
              </h2>
              <button
                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                  showProyekForm 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-[#59B997] text-white hover:bg-[#4ca584] shadow-sm'
                }`}
                onClick={() => {
                  // If detail view is open, close it
                  if (selectedProyek) {
                    clearDetailView();
                  }
                  
                  setShowProyekForm(!showProyekForm);
                  if (showProyekForm) {
                    clearFormProyek();
                  } else {
                    // Scroll to form after a short delay
                    setTimeout(() => {
                      const formElement = document.querySelector('.proyek-form');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }
                }}
              >
                {!showProyekForm && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                {showProyekForm ? 'Tutup Form' : 'Tambah Proyek Baru'}
              </button>
            </div>

            {/* Form Proyek Card with Animation */}
            <AnimatePresence>
              {showProyekForm && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden proyek-form"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                        {formProyek.proyek_id ? 'Edit Proyek' : 'Tambah Proyek Baru'}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Nama Proyek *</label>
                          <input
                            name="nama_item"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                            value={formProyek.nama_item}
                            onChange={handleFormProyekChange}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Kebutuhan Dana *</label>
                          <input
                            name="target_dana"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                            value={displayTargetDana}
                            onChange={handleFormProyekChange}
                            placeholder="Masukkan kebutuhan dana"
                          />
                        </div>
                        
                        {/* Add Image Upload */}
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Gambar Proyek</label>
                          <div className="mt-1 flex items-center">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".jpg,.jpeg,.png,.webp"
                              className="sr-only"
                              id="gambar-proyek"
                            />
                            <label
                              htmlFor="gambar-proyek"
                              className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              {formFile ? 'Ganti Gambar' : 'Pilih Gambar'}
                            </label>
                            <span className="ml-3 text-sm text-gray-500">
                              {formFile ? formFile.name : 'JPG, PNG, WebP (Maks. 1MB)'}
                            </span>
                          </div>
                          {previewImage && (
                            <div className="mt-3 relative">
                              <div className="relative group">
                                <img 
                                  src={previewImage} 
                                  alt="Preview" 
                                  className="h-40 object-cover rounded-lg border border-gray-200" 
                                />
                                <div 
                                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all rounded-lg"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewImage(null);
                                      setFormFile(null);
                                      if (fileInputRef.current) fileInputRef.current.value = null;
                                    }}
                                    className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Deskripsi *</label>
                          <textarea
                            name="deskripsi"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                            value={formProyek.deskripsi}
                            onChange={handleFormProyekChange}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            clearFormProyek();
                            setShowProyekForm(false);
                          }}
                        >
                          Batal
                        </button>
                        <button
                          className="px-6 py-2 bg-[#59B997] text-white rounded-lg hover:bg-[#4ca584] transition-colors shadow-sm"
                          onClick={handleSubmitProyek}
                        >
                          {formProyek.proyek_id ? 'Simpan Perubahan' : 'Tambah Proyek'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Daftar Proyek */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                    Daftar Proyek
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {filteredProyeks.length} proyek
                  </span>
                </div>
              </div>

              {/* Search Filter */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] sm:text-sm"
                    placeholder="Cari proyek berdasarkan nama atau deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Sorting and Filtering Options */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {/* Sort options */}
                  <div className="flex items-center">
                    <label htmlFor="sort-select" className="text-sm text-gray-500 mr-2">
                      Urutkan:
                    </label>
                    <select
                      id="sort-select"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]"
                    >
                      <option value="date-desc">Terbaru</option>
                      <option value="date-asc">Terlama</option>
                      <option value="title-asc">Judul (A-Z)</option>
                      <option value="title-desc">Judul (Z-A)</option>
                    </select>
                  </div>
                  
                  {/* Status filter */}
                  <div className="flex items-center">
                    <label htmlFor="status-filter" className="text-sm text-gray-500 mr-2">
                      Status:
                    </label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]"
                    >
                      <option value="all">Semua</option>
                      <option value="completed">Tercapai</option>
                      <option value="in-progress">Dalam Progress</option>
                    </select>
                  </div>
                  
                  {/* Reset filters button */}
                  {(searchTerm || sortOption !== 'date-desc' || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSortOption('date-desc');
                        setStatusFilter('all');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Filter
                    </button>
                  )}
                </div>
              </div>
              
              {filteredProyeks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">
                    {searchTerm ? "Tidak ada proyek yang sesuai dengan pencarian" : "Belum ada proyek"}
                  </h3>
                  <p className="mt-1 text-gray-500">
                    {searchTerm ? "Coba kata kunci lain atau reset pencarian" : "Tambahkan proyek pertama Anda"}
                  </p>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Pencarian
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {currentProjects.map((p) => {
                    return (
                      <div
                        key={p.proyek_id}
                        className={`p-6 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer relative ${
                          selectedProyek?.proyek_id === p.proyek_id 
                            ? 'bg-green-50 border-l-4 border-[#59B997] shadow-md' 
                            : ''
                        }`}
                        onClick={(e) => handleProyekClick(p, e)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            {/* Display project image thumbnail if available */}
                            {p.gambar && (
                              <div 
                                className="flex-shrink-0 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenImageModal(`/storage/${p.gambar}`);
                                }}
                              >
                                <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:opacity-90 transition-opacity">
                                  <img 
                                    src={`/storage/${p.gambar}`} 
                                    alt={p.nama_item} 
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/80?text=Error';
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-semibold text-lg text-gray-800 flex items-center group">
                                  {p.nama_item}
                                  {selectedProyek?.proyek_id === p.proyek_id && (
                                    <span className="ml-2 bg-[#59B997] text-white text-xs px-2 py-0.5 rounded-full">Dipilih</span>
                                  )}
                                  <span className="ml-2 text-xs text-[#59B997] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    Klik untuk melihat detail
                                  </span>
                                </h3>
                              </div>
                              
                              {/* Project status and creation date */}
                              <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {formatDate(p.created_at)}
                                </div>
                                
                                {/* Progress status badge */}
                                {(() => {
                                  const progress = hitungProgress(p);
                                  return progress >= 100 ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <svg className="mr-1 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx="4" cy="4" r="3" />
                                      </svg>
                                      Tercapai
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <svg className="mr-1 h-2 w-2 text-yellow-500" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx="4" cy="4" r="3" />
                                      </svg>
                                      Dalam Proses
                                    </span>
                                  );
                                })()}
                              </div>
                              
                              <p className="text-gray-600 text-sm mt-2">{p.deskripsi}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProyek(p);
                              }}
                              className="text-gray-500 hover:text-[#59B997] p-1.5 rounded-full hover:bg-gray-100"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProyek(p.proyek_id);
                              }}
                              className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                              title="Hapus"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => handleDetailButtonClick(e, p)}
                              className={`${
                                selectedProyek && selectedProyek.proyek_id === p.proyek_id 
                                  ? "text-blue-500 bg-blue-50" 
                                  : "text-gray-500 hover:text-blue-500 hover:bg-gray-100"
                              } p-1.5 rounded-full transition-colors`}
                              title={selectedProyek && selectedProyek.proyek_id === p.proyek_id ? "Tutup Detail" : "Lihat Detail"}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Dana Dialokasikan: {formatCurrency(getTotalExpenses(p.proyek_id))}</span>
                            <span>Kebutuhan: {formatCurrency(p.target_dana || 0)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-[#59B997] h-2.5 rounded-full flex items-center justify-end"
                              style={{ width: `${hitungProgress(p)}%` }}
                            >
                              <div className="w-2 h-2 rounded-full bg-white mr-0.5"></div>
                            </div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">{hitungProgress(p)}% tercapai</span>
                            {hitungProgress(p) >= 100 && (
                              <span className="text-xs text-green-600 font-medium">Target tercapai!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Pagination Controls */}
                  {filteredProyeks.length > projectsPerPage && (
                    <div className="flex justify-between items-center p-6">
                      <div className="text-sm text-gray-500">
                        Menampilkan {indexOfFirstProject + 1}-{Math.min(indexOfLastProject, filteredProyeks.length)} dari {filteredProyeks.length} proyek
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === 1 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                          }`}
                        >
                          Sebelumnya
                        </button>
                        <div className="flex space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                                currentPage === number
                                  ? 'bg-[#59B997] text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              {number}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === totalPages 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
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
            
            {/* Detail Section */}
            <AnimatePresence>
              {selectedProyek && proyekDetail && (
                <motion.div
                  ref={detailSectionRef}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3 
                  }}
                  className="overflow-hidden mt-8"
                >
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Detail Header */}
                    <div className="bg-gradient-to-r from-[#59B997] to-[#3a9b7d] text-white p-6 flex justify-between items-center">
                      <div className="flex items-center">
                        <h2 className="text-xl font-bold">Detail Proyek: {proyekDetail.nama_item}</h2>
                      </div>
                      <button
                        onClick={clearDetailView}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {detailLoading ? (
                      <div className="flex justify-center items-center p-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#59B997]"></div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="bg-white rounded-xl overflow-hidden mb-6">
                          <div className="p-4">
                            <p className="text-gray-600 mb-6">{proyekDetail.deskripsi}</p>
                            
                            {/* Project Image */}
                            {proyekDetail.gambar && (
                              <div className="mb-6">
                                <img 
                                  src={`/storage/${proyekDetail.gambar}`} 
                                  alt={proyekDetail.nama_item} 
                                  className="rounded-lg shadow-sm max-h-64 object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Progress Bar */}
                                                          <div className="mb-2 flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">
                                Progress Pendanaan ({detailStats.persentasePengeluaran}%)
                              </span>
                              <span className="text-sm font-medium text-gray-700">
                                {formatCurrency(detailStats.totalPengeluaran)} / {formatCurrency(proyekDetail.target_dana)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                              <div 
                                className="bg-[#59B997] h-4 rounded-full"
                                style={{ width: `${detailStats.persentasePengeluaran}%` }}
                              ></div>
                            </div>
                            
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                              <button 
                                onClick={() => refreshProjectStats(proyekDetail.proyek_id)}
                                className="absolute -top-10 right-0 text-sm flex items-center text-gray-500 hover:text-[#59B997] transition-colors"
                                title="Refresh data"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                              </button>
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <p className="text-sm text-blue-600 font-medium">Kebutuhan Dana</p>
                                <p className="text-xl font-bold text-blue-800">{formatCurrency(proyekDetail.target_dana)}</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-green-600 font-medium">Dana Dialokasikan</p>
                                <p className="text-xl font-bold text-green-800">{formatCurrency(detailStats.totalPengeluaran)}</p>
                              </div>
                              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                                <p className="text-sm text-yellow-600 font-medium">Saldo</p>
                                <p className="text-xl font-bold text-yellow-800">{formatCurrency(detailStats.sisaDana)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pengeluaran Section */}
                        <div className="bg-white shadow rounded-xl p-6 mb-6">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                              <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                              Pengeluaran Proyek
                            </h2>
                            <button
                              onClick={() => {
                                clearDetailForm();
                                setShowPengeluaranForm(!showPengeluaranForm);
                              }}
                              className="px-4 py-2 bg-[#59B997] text-white rounded-lg hover:bg-[#4ca584] transition-colors shadow-sm flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              {showPengeluaranForm ? 'Tutup Form' : 'Tambah Pengeluaran'}
                            </button>
                          </div>

                          {/* Pengeluaran Form */}
                          <AnimatePresence>
                            {showPengeluaranForm && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
                                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                                    {detailFormPengeluaran.pengeluaran_id ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="block text-sm font-medium text-gray-700">Nama Pengeluaran *</label>
                                      <input
                                        name="nama_pengeluaran"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                                        value={detailFormPengeluaran.nama_pengeluaran}
                                        onChange={handleDetailFormChange}
                                        placeholder="Contoh: Pembelian Bahan Bangunan"
                                      />
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <label className="block text-sm font-medium text-gray-700">Jumlah *</label>
                                      <input
                                        name="jumlah"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                                        value={displayDetailJumlah}
                                        onChange={handleDetailFormChange}
                                        placeholder="Masukkan jumlah pengeluaran"
                                      />
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <label className="block text-sm font-medium text-gray-700">Kategori *</label>
                                      <select
                                        name="kategori_pengeluaran_id"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                                        value={detailFormPengeluaran.kategori_pengeluaran_id}
                                        onChange={handleDetailFormChange}
                                      >
                                        <option value="">Pilih Kategori</option>
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
                                    
                                    
                                    
                                    <div className="md:col-span-2 space-y-1">
                                      <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                                      <textarea
                                        name="keterangan"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                                        value={detailFormPengeluaran.keterangan}
                                        onChange={handleDetailFormChange}
                                        placeholder="Tambahkan keterangan (opsional)"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                      onClick={() => {
                                        clearDetailForm();
                                        setShowPengeluaranForm(false);
                                      }}
                                    >
                                      Batal
                                    </button>
                                    <button
                                      className="px-6 py-2 bg-[#59B997] text-white rounded-lg hover:bg-[#4ca584] transition-colors shadow-sm"
                                      onClick={handleSubmitDetailPengeluaran}
                                    >
                                      {detailFormPengeluaran.pengeluaran_id ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Filter dan Pencarian Pengeluaran */}
                          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {/* Pencarian nama pengeluaran */}
                              <div className="col-span-2">
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
                              
                              {/* Filter kategori */}
                              <div>
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
                              
                              {/* Pengurutan */}
                              <div>
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

                          {/* Daftar Pengeluaran */}
                          {proyekPengeluarans.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-700">Belum ada pengeluaran</h3>
                              <p className="mt-1 text-gray-500">Tambahkan pengeluaran pertama untuk proyek ini</p>
                            </div>
                          ) : filteredProyekPengeluarans.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-700">Tidak ada pengeluaran yang sesuai</h3>
                              <p className="mt-1 text-gray-500">Coba ubah filter atau reset pencarian</p>
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
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {/* Calculate pagination for expenses */}
                                  {filteredProyekPengeluarans
                                    .slice(
                                      (currentPengeluaranPage - 1) * pengeluaranPerPage,
                                      currentPengeluaranPage * pengeluaranPerPage
                                    )
                                    .map((p, index) => (
                                    <tr 
                                      key={p.pengeluaran_id} 
                                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                    >
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{p.nama_pengeluaran}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-red-600">-{formatCurrency(p.jumlah)}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          {getCategoryName(p.kategori_pengeluaran_id)}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{formatDate(p.created_at)}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 max-w-xs truncate">{p.keterangan || '-'}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditDetailPengeluaran(p);
                                          }}
                                          className="text-[#59B997] hover:text-[#4ca584] mr-3"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={(e) => handleDeleteDetailPengeluaran(p.pengeluaran_id)}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Hapus
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              
                              {/* Pagination Controls for Expenses */}
                              {filteredProyekPengeluarans.length > pengeluaranPerPage && (
                                <div className="flex justify-between items-center p-4 border-t border-gray-200">
                                  <div className="text-sm text-gray-500">
                                    Menampilkan {Math.min(filteredProyekPengeluarans.length, 1 + (currentPengeluaranPage - 1) * pengeluaranPerPage)}-{Math.min(currentPengeluaranPage * pengeluaranPerPage, filteredProyekPengeluarans.length)} dari {filteredProyekPengeluarans.length} pengeluaran
                                  </div>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => setCurrentPengeluaranPage(prev => Math.max(prev - 1, 1))}
                                      disabled={currentPengeluaranPage === 1}
                                      className={`px-3 py-1 rounded-lg border transition-colors ${
                                        currentPengeluaranPage === 1 
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                      }`}
                                    >
                                      Sebelumnya
                                    </button>
                                    <div className="flex space-x-1">
                                      {Array.from(
                                        { length: Math.ceil(filteredProyekPengeluarans.length / pengeluaranPerPage) },
                                        (_, i) => i + 1
                                      ).map(number => (
                                        <button
                                          key={number}
                                          onClick={() => setCurrentPengeluaranPage(number)}
                                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                                            currentPengeluaranPage === number
                                              ? 'bg-[#59B997] text-white'
                                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                          }`}
                                        >
                                          {number}
                                        </button>
                                      ))}
                                    </div>
                                    <button 
                                      onClick={() => setCurrentPengeluaranPage(prev => 
                                        Math.min(prev + 1, Math.ceil(filteredProyekPengeluarans.length / pengeluaranPerPage))
                                      )}
                                      disabled={currentPengeluaranPage >= Math.ceil(filteredProyekPengeluarans.length / pengeluaranPerPage)}
                                      className={`px-3 py-1 rounded-lg border transition-colors ${
                                        currentPengeluaranPage >= Math.ceil(filteredProyekPengeluarans.length / pengeluaranPerPage)
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
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
                        
                        {/* Warning Card */}
                        {detailStats.sisaDana < 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Peringatan: Dana Minus</h3>
                                <div className="mt-2 text-sm text-red-700">
                                  <p>
                                    Total pengeluaran melebihi dana yang terkumpul. Mohon periksa kembali pengeluaran atau tambahkan dana.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Pengeluaran Tab */}
        {activeTab === 'pengeluaran' && selectedProyek && (
          <div className="space-y-8">
            {/* Filter Pengeluaran Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                  Filter Pengeluaran
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select
                      name="kategori_pengeluaran_id"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={filterPengeluaran.kategori_pengeluaran_id}
                      onChange={(e) => setFilterPengeluaran({ kategori_pengeluaran_id: e.target.value })}
                    >
                      <option value="">Semua Kategori</option>
                      {kategoris.map((k) => (
                        <option key={k.kategori_pengeluaran_id || k.id} value={k.kategori_pengeluaran_id || k.id}>
                          {k.nama_kategori}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilterPengeluaran({ kategori_pengeluaran_id: '' })}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full"
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Pengeluaran Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                  {formPengeluaran.pengeluaran_id ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Nama Pengeluaran *</label>
                    <input
                      name="nama_pengeluaran"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formPengeluaran.nama_pengeluaran}
                      onChange={handleFormPengeluaranChange}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Jumlah *</label>
                    <input
                      name="jumlah"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={displayJumlah}
                      onChange={handleFormPengeluaranChange}
                      placeholder="Masukkan jumlah pengeluaran"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Kategori *</label>
                    <select
                      name="kategori_pengeluaran_id"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formPengeluaran.kategori_pengeluaran_id}
                      onChange={handleFormPengeluaranChange}
                    >
                      <option value="">Pilih Kategori</option>
                      {kategoris.map((k) => (
                        <option 
                          key={k.kategori_pengeluaran_id || k.id} 
                          value={k.kategori_pengeluaran_id || k.id}
                        >
                          {k.nama_kategori}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                    <textarea
                      name="keterangan"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formPengeluaran.keterangan}
                      onChange={handleFormPengeluaranChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={clearFormPengeluaran}
                  >
                    Batal
                  </button>
                  <button
                    className="px-6 py-2 bg-[#59B997] text-white rounded-lg hover:bg-[#4ca584] transition-colors shadow-sm"
                    onClick={handleSubmitPengeluaran}
                  >
                    {formPengeluaran.pengeluaran_id ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
                  </button>
                </div>
              </div>
            </div>

            {/* Daftar Pengeluaran Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                    Daftar Pengeluaran - {selectedProyek.nama_item}
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {pengeluarans.length} pengeluaran
                  </span>
                </div>
              </div>
              
              {pengeluarans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Belum ada pengeluaran</h3>
                  <p className="mt-1 text-gray-500">Tambahkan pengeluaran pertama Anda</p>
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
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pengeluarans.map((p) => (
                        <tr 
                          key={p.pengeluaran_id} 
                          className={pengeluarans.indexOf(p) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{p.nama_pengeluaran}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-red-600">-{formatCurrency(p.jumlah)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {getCategoryName(p.kategori_pengeluaran_id)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(p.created_at)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">{p.keterangan || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPengeluaran(p);
                              }}
                              className="text-[#59B997] hover:text-[#4ca584] mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => handleDeletePengeluaran(p.pengeluaran_id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={handleCloseImageModal}
            style={{ zIndex: 40 }}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg max-w-3xl w-full z-50">
            <div className="absolute top-0 right-0 m-4">
              <button
                onClick={handleCloseImageModal}
                className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 hover:bg-gray-100 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <img 
                src={modalImage} 
                alt="Project" 
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProyekPembangunan;



