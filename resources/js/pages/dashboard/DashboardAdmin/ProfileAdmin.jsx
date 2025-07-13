import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Edit2
} from "lucide-react";
import { PROFILE_UPDATED_EVENT } from "../../../components/Header/UserDropdown";

// Custom color for consistency with other pages
const customGreen = "#59B997";

const ProfileAdmin = () => {
  // State for profile data
  const [userData, setUserData] = useState({
    nama: "",
    email: "",
    nomor_hp: "",
    role: "admin",
    created_at: "",
    email_verified_at: null,
  });

  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("profile");
  
  // State for password change form
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  
  // State for password visibility
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // State for editing fields
  const [editing, setEditing] = useState({
    nama: false,
    nomor_hp: false,
  });
  
  // State for edited values
  const [editValues, setEditValues] = useState({
    nama: "",
    nomor_hp: "",
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }
      
      // Test the public endpoint first
      try {
        const publicResponse = await axios.get("/api/public/admin-profile-test");
        console.log("Public test response:", publicResponse.data);
      } catch (publicError) {
        console.error("Public test error:", publicError);
      }
      
      // Check authentication status
      try {
        const authResponse = await axios.get("/api/debug-auth", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Auth debug response:", authResponse.data);
        
        // If not admin, show error
        if (!authResponse.data.is_admin) {
          setError("Anda tidak memiliki akses admin.");
          setLoading(false);
          return;
        }
      } catch (authError) {
        console.error("Auth debug error:", authError);
        setError("Gagal memverifikasi status autentikasi.");
        setLoading(false);
        return;
      }
      
      // Test admin middleware
      try {
        const middlewareResponse = await axios.get("/api/test-admin-middleware", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Admin middleware test response:", middlewareResponse.data);
      } catch (middlewareError) {
        console.error("Admin middleware test error:", middlewareError);
      }
      
      // Test both admin middlewares
      try {
        const bothMiddlewaresResponse = await axios.get("/api/test-both-admin-middlewares", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Both admin middlewares test response:", bothMiddlewaresResponse.data);
      } catch (bothMiddlewaresError) {
        console.error("Both admin middlewares test error:", bothMiddlewaresError);
      }
      
      // If all tests pass, try to get the actual profile data
      try {
        const response = await axios.get("/api/admin-profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUserData(response.data);
        setEditValues({
          nama: response.data.nama || "",
          nomor_hp: response.data.nomor_hp || "",
        });
        setLoading(false);
      } catch (profileError) {
        console.error("Error fetching profile data:", profileError);
        
        let errorMessage = "Gagal memuat data profil. Silakan coba lagi.";
        
        if (profileError.response) {
          console.log("Error response:", profileError.response);
          if (profileError.response.status === 403) {
            errorMessage = "Anda tidak memiliki akses admin untuk melihat halaman ini.";
          } else if (profileError.response.data && profileError.response.data.message) {
            errorMessage = profileError.response.data.message;
          }
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (err) {
      return dateString;
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password visibility toggle
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Handle edit mode toggle
  const toggleEdit = (field) => {
    setEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    
    // Reset edit value if cancelling
    if (editing[field]) {
      setEditValues(prev => ({
        ...prev,
        [field]: userData[field] || ""
      }));
    }
  };
  
  // Handle edit value changes
  const handleEditChange = (e, field) => {
    const { value } = e.target;
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Submit profile changes
  const saveProfileChanges = async (field) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali."
        });
        return;
      }
      
      const updateData = { [field]: editValues[field] };
      
      await axios.put("/api/admin-profile/update", updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        [field]: editValues[field]
      }));
      
      // Update user data in localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const updatedUser = {
            ...parsedUser,
            name: field === 'nama' ? editValues[field] : parsedUser.name
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (error) {
          console.error("Failed to update user data in localStorage", error);
        }
      }
      
      // Dispatch the custom profile update event
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
      
      // Exit edit mode
      toggleEdit(field);
      
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Gagal memperbarui ${field}. Silakan coba lagi.`
      });
    }
  };
  
  // Submit password change
  const submitPasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.password !== passwordForm.password_confirmation) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Password baru dan konfirmasi password tidak cocok."
      });
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali."
        });
        return;
      }
      
      await axios.post("/api/admin-profile/change-password", {
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Reset form
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password berhasil diubah",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error changing password:", err);
      
      let errorMessage = "Gagal mengubah password. Silakan coba lagi.";
      
      // Check for specific error messages from backend
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil Admin</h1>
        <p className="text-gray-500">Kelola informasi profil dan keamanan akun Anda</p>
      </div>
      
      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => handleTabChange("profile")}
              className={`inline-block px-4 py-2 ${
                activeTab === "profile"
                  ? `border-b-2 font-semibold`
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === "profile" ? { borderColor: customGreen, color: customGreen } : {}}
            >
              Informasi Profil
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("password")}
              className={`inline-block px-4 py-2 ${
                activeTab === "password"
                  ? `border-b-2 font-semibold`
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === "password" ? { borderColor: customGreen, color: customGreen } : {}}
            >
              Ubah Password
            </button>
          </li>
        </ul>
      </div>
      
      {/* Content area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: customGreen }}></div>
            <span className="ml-2">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            <XCircle size={48} className="mx-auto mb-4" />
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <>
            {/* Profile Information Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-100">
                  <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                    <User className="mr-2 text-gray-500" size={20} />
                    <span className="text-gray-600 font-medium">Nama Lengkap</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center md:w-2/3">
                    {editing.nama ? (
                      <div className="flex items-center w-full">
                        <input
                          type="text"
                          value={editValues.nama}
                          onChange={(e) => handleEditChange(e, "nama")}
                          className="border border-gray-300 rounded-md px-3 py-2 mr-2 flex-grow"
                          placeholder="Masukkan nama lengkap"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveProfileChanges("nama")}
                            className="px-3 py-1 rounded-md text-white"
                            style={{ backgroundColor: customGreen }}
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => toggleEdit("nama")}
                            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center w-full">
                        <span className="text-gray-800">{userData.nama || "-"}</span>
                        <button
                          onClick={() => toggleEdit("nama")}
                          className="ml-2 p-1 rounded-full hover:bg-gray-100"
                          aria-label="Edit nama"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-100">
                  <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                    <Mail className="mr-2 text-gray-500" size={20} />
                    <span className="text-gray-600 font-medium">Email</span>
                  </div>
                  <div className="md:w-2/3">
                    <span className="text-gray-800">{userData.email || "-"}</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-100">
                  <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                    <Phone className="mr-2 text-gray-500" size={20} />
                    <span className="text-gray-600 font-medium">Nomor HP</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center md:w-2/3">
                    {editing.nomor_hp ? (
                      <div className="flex items-center w-full">
                        <input
                          type="text"
                          value={editValues.nomor_hp}
                          onChange={(e) => handleEditChange(e, "nomor_hp")}
                          className="border border-gray-300 rounded-md px-3 py-2 mr-2 flex-grow"
                          placeholder="Masukkan nomor HP"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveProfileChanges("nomor_hp")}
                            className="px-3 py-1 rounded-md text-white"
                            style={{ backgroundColor: customGreen }}
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => toggleEdit("nomor_hp")}
                            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center w-full">
                        <span className="text-gray-800">{userData.nomor_hp || "-"}</span>
                        <button
                          onClick={() => toggleEdit("nomor_hp")}
                          className="ml-2 p-1 rounded-full hover:bg-gray-100"
                          aria-label="Edit nomor HP"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-100">
                  <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                    <Shield className="mr-2 text-gray-500" size={20} />
                    <span className="text-gray-600 font-medium">Role</span>
                  </div>
                  <div className="md:w-2/3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {userData.role || "Admin"}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-100">
                  <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                    <Calendar className="mr-2 text-gray-500" size={20} />
                    <span className="text-gray-600 font-medium">Tanggal Bergabung</span>
                  </div>
                  <div className="md:w-2/3">
                    <span className="text-gray-800">{formatDate(userData.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center py-4">
                  <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                    <CheckCircle className="mr-2 text-gray-500" size={20} />
                    <span className="text-gray-600 font-medium">Status Verifikasi Email</span>
                  </div>
                  <div className="md:w-2/3">
                    {userData.email_verified_at ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={14} className="mr-1" /> 
                        Terverifikasi pada {formatDate(userData.email_verified_at)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={14} className="mr-1" /> 
                        Belum Terverifikasi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Change Password Tab */}
            {activeTab === "password" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto"
              >
                <form onSubmit={submitPasswordChange} className="space-y-6">
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password Lama
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        id="current_password"
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        required
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#59B997]/60 focus:border-[#59B997]"
                        placeholder="Masukkan password lama"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="password"
                        name="password"
                        value={passwordForm.password}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#59B997]/60 focus:border-[#59B997]"
                        placeholder="Masukkan password baru (min. 8 karakter)"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="password_confirmation"
                        name="password_confirmation"
                        value={passwordForm.password_confirmation}
                        onChange={handlePasswordChange}
                        required
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#59B997]/60 focus:border-[#59B997]"
                        placeholder="Konfirmasi password baru"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordForm.password && passwordForm.password_confirmation && 
                     passwordForm.password !== passwordForm.password_confirmation && (
                      <p className="mt-1 text-sm text-red-600">
                        Password tidak cocok dengan konfirmasi
                      </p>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: customGreen }}
                      disabled={!passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation || 
                              (passwordForm.password !== passwordForm.password_confirmation)}
                    >
                      Ubah Password
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileAdmin;
