Analisis Halaman Masjid Taqwa
Dokumen ini berisi analisis mendetail mengenai tampilan, fungsionalitas, dan data yang terlibat untuk setiap halaman dan komponen dalam aplikasi Sistem Informasi Manajemen Donasi Pembangunan Masjid Taqwa Muhammadiyah Batam Kota.

- **Environment & Origin**
    - Laravel & React dijalankan bersamaan di `http://localhost:8000` → tidak perlu konfigurasi CORS.
- **Login Logic (`LoginBaru.jsx`)**
    1. **Form State**
        - `useState` untuk `email`, `password`, dan `errorMessage`.
    2. **HTTP Request**
        - `axios.post('/api/login', { email, password })`.
    3. **Response Handling**
        - Jika sukses **dan** `role === 'admin'`:
            - Simpan `token` dan `user` (`{ name, email }`) di `localStorage`.
            - Redirect ke `/dashboard` dengan `useNavigate(…, { replace: true })`.
        - Jika gagal atau bukan admin:
            - Set `errorMessage` → tampilkan alert Tailwind merah.
- **Protected Routes (di `App.jsx` atau wrapper)**
    - Cek `localStorage.getItem('token')` sebelum render route dashboard.
    - Jika token tidak ada → redirect ke `/login`.
    - Jika token ada dan user mencoba akses `/login` → redirect ke `/dashboard`.
- **Persistensi Setelah Refresh**
    - Saat `DashboardHome.jsx` mount, pengecekan token di `localStorage`:
        - Masih valid → biarkan di dashboard.
        - Tidak ada/invalid → redirect ke login.
- **Logout Logic (`UserDropdown.jsx`)**
    1. `handleLogout()` menghapus `token` **dan** `user` dari `localStorage`.
    2. Redirect ke `/` dengan `{ replace: true }` untuk mencegah "back button" kembali ke dashboard.
    3. Proteksi route (lihat Protected Routes) memastikan back button tidak bisa akses dashboard tanpa token.
- **User Dropdown (dinamis)**
    - Saat mount, baca `localStorage.getItem('user')` → `JSON.parse` → simpan ke state (`useState`/`useEffect`).
    - Tampilkan `user.name` dan `user.email` di dropdown alih-alih teks statis.

catatan agar setiap kali butuh mengingat flow auth, pengecekan token, atau storage key (`token`, `user`).

1. Halaman Beranda (resources/js/pages/Beranda.jsx)
Tampilan
Halaman Beranda merupakan halaman utama yang menampilkan berbagai komponen landing page, antara lain:

NavbarBaru: Navigasi utama dengan menu Beranda, Informasi, Transparansi, dan Hubungi.
HomeContent: Hero section dengan ajakan donasi dan gambar masjid.
HomeContentAbout: Sekilas tentang SIDONTAQ dengan deskripsi dan gambar.
HomeContentEco: Menampilkan fitur-fitur utama SIDONTAQ dalam bentuk kartu dengan ikon.
HomeContentAdvantage: Menampilkan keunggulan SIDONTAQ dalam bentuk kartu.
HomeContentContact: Bagian kontak dengan gambar dan informasi kontak.
HomeContentSignUp: Ajakan untuk mendaftar dengan gambar ilustrasi.
SimpleFooter: Footer dengan navigasi dan informasi hak cipta.
Fungsionalitas
Navigasi menggunakan react-router-dom dengan menu yang mendukung submenu dan smooth scrolling ke anchor.
Animasi scroll menggunakan AOS (Animate On Scroll).
Tombol donasi dan daftar mengarahkan ke halaman terkait.
Footer menyediakan link navigasi dan informasi kontak.
Data yang Terlibat
Menu navigasi diambil dari array Menus di utils.js.
Gambar dan ikon statis digunakan untuk visualisasi.
Tidak ada data dinamis yang diambil dari API pada halaman ini.
2. Halaman Hubungi (resources/js/pages/Hubungi.jsx)
Tampilan
NavbarBaru sebagai navigasi.
HeroSectionHubungi: Judul halaman "Hubungi Kami" dengan latar belakang hijau.
ContactSectionForm: Formulir kontak dengan input nama depan, nama belakang, email, dan pesan.
HubungiContentReminder: Bagian promosi eMasjid dengan gambar dan teks ajakan.
SimpleFooter sebagai footer.
Fungsionalitas
Form kontak menggunakan komponen Material Tailwind untuk input dan tombol.
Form belum terhubung ke backend (hanya UI).
Tombol dan link navigasi berfungsi sesuai rute.
Data yang Terlibat
Data form di-handle secara lokal dengan state React.
Gambar dan ikon statis untuk ilustrasi.
3. Halaman LoginBaru (resources/js/pages/LoginBaru.jsx)
Tampilan
Form login dengan input email, password, dan checkbox "Ingat Saya".
Tombol login dan link lupa kata sandi serta daftar.
Gambar latar belakang di sisi kiri untuk desktop.
Tombol kembali ke halaman utama.
Fungsionalitas
Mengirim data login ke endpoint /api/login menggunakan fetch POST.
Menangani respons login dan navigasi ke dashboard admin jika berhasil.
Menampilkan pesan error jika login gagal.
Data yang Terlibat
Data login dikirim ke backend API.
Respons API menentukan navigasi dan pesan error.
4. Halaman LupaPassword (resources/js/pages/LupaPassword.jsx)
Tampilan
Form input email untuk reset password.
Tombol reset dan link kembali ke login.
Gambar latar belakang di sisi kiri untuk desktop.
Tombol kembali ke halaman utama.
Fungsionalitas
Form reset password belum terhubung ke backend (hanya UI).
Animasi fade-in saat halaman dimuat.
Data yang Terlibat
Data email di-handle secara lokal dengan state React.
5. Halaman RekapanBulanan (resources/js/pages/RekapanBulanan.jsx)
Tampilan
NavbarBaru sebagai navigasi.
HeroSectionRekapanBulanan dengan judul "Rekapan Bulanan".
Grafik donasi bulanan menggunakan DonationChartBulanan.
SimpleFooter sebagai footer.
Fungsionalitas
DonationChartBulanan mengambil data dari API /api/donation-stats.
Menampilkan grafik garis donasi bulanan dengan format mata uang Rupiah.
Tombol "Details" (fungsi belum dijelaskan).
Data yang Terlibat
Data donasi bulanan diambil dari API.
Data digunakan untuk membuat grafik interaktif.
6. Halaman RekapanDonatur (resources/js/pages/RekapanDonatur.jsx)
Tampilan
NavbarBaru sebagai navigasi.
HeroSectionRekapanDonatur dengan judul "Rekapan Donatur".
Tabel donatur menggunakan DonationTableDonatur.
SimpleFooter sebagai footer.
Fungsionalitas
DonationTableDonatur menggunakan PrimeReact DataTable untuk menampilkan data donatur.
Data sumber belum jelas (variabel customers tidak didefinisikan dalam komponen).
Data yang Terlibat
Data donatur kemungkinan diambil dari API (tidak terlihat di kode).
Tabel menampilkan nama, negara, perusahaan, dan perwakilan.
7. Halaman SignUp (resources/js/pages/SignUp.jsx)
Tampilan
Form pendaftaran dengan input email, password, dan checkbox "Ingat Saya".
Tombol daftar dan link ke halaman login.
Gambar latar belakang di sisi kanan untuk desktop.
Tombol kembali ke halaman utama.
Fungsionalitas
Form pendaftaran mengelola state lokal.
Submit form saat ini hanya mencetak data ke konsol (belum terhubung backend).
Data yang Terlibat
Data pendaftaran di-handle secara lokal.
8. Komponen Navigasi Desktop (resources/js/components/LandingPage/DesktopMenu.jsx)
Fungsionalitas
Menampilkan menu desktop dengan submenu yang muncul saat hover.
Mendukung link dengan hash anchor dan smooth scrolling dengan offset.
Menggunakan framer-motion untuk animasi submenu.
Mendukung grid submenu dengan 1-3 kolom.
Menggunakan react-router-dom dan react-router-hash-link untuk navigasi.
9. Komponen MainContent (resources/js/components/LandingPage/MainContent.jsx)
Fungsionalitas
Placeholder untuk konten utama dashboard.
Menampilkan judul "Kelola Pesanan" dan contoh konten.
10. Komponen Navigasi Mobile (resources/js/components/LandingPage/MobMenu.jsx)
Fungsionalitas
Menampilkan menu mobile dengan drawer yang dapat dibuka/tutup.
Mendukung submenu yang dapat diperluas.
Mendukung link dengan hash anchor dan smooth scrolling dengan offset.
Menggunakan framer-motion untuk animasi drawer dan submenu.
Menggunakan react-router-dom dan react-router-hash-link untuk navigasi.
11. Komponen ScrollToTop (resources/js/components/LandingPage/ScrollToTop.jsx)
Fungsionalitas
Scroll otomatis ke atas saat navigasi halaman atau ke elemen hash.
Menampilkan tombol scroll-to-top saat halaman di-scroll ke bawah.
12. Komponen Sidebar (resources/js/components/LandingPage/Sidebar.jsx)
Fungsionalitas
Sidebar statis dengan navigasi sederhana.
Menampilkan link ke Beranda, Alamat, Toko, Pesanan, dan Poin.
Tombol Logout.
13. Komponen Topbar (resources/js/components/LandingPage/Topbar.jsx)
Fungsionalitas
Bar atas untuk dashboard pengelola bank sampah.
Menampilkan judul dan nama pengguna.
14. Context Sidebar (resources/js/context/SidebarContext.jsx)
Fungsionalitas
Mengelola state sidebar: expanded, mobile open, hover, active item, submenu terbuka.
Menangani perubahan ukuran jendela untuk responsivitas.
Menyediakan fungsi toggle untuk sidebar dan submenu.
15. Context Theme (resources/js/context/ThemeContext.jsx)
Fungsionalitas
Mengelola tema aplikasi (light/dark).
Menyimpan preferensi tema di localStorage.
Mengubah kelas root dokumen untuk tema gelap.
16. Hook useGoBack (resources/js/hooks/useGoBack.js)
Fungsionalitas
Custom hook untuk navigasi kembali.
Navigasi ke halaman sebelumnya jika ada, atau ke halaman utama jika tidak ada riwayat.
17. Hook useModal (resources/js/hooks/useModal.js)
Fungsionalitas
Custom hook untuk mengelola state modal.
Menyediakan fungsi buka, tutup, dan toggle modal.
18. Layout AppHeader (resources/js/layout/AppHeader.jsx)
Fungsionalitas
Header aplikasi dengan tombol toggle sidebar.
Menampilkan logo dan dropdown pengguna.
Mendukung shortcut keyboard untuk fokus input.
19. Layout AppLayout (resources/js/layout/AppLayout.jsx)
Fungsionalitas
Layout utama aplikasi.
Menggunakan SidebarProvider untuk konteks sidebar.
Menampilkan sidebar, backdrop, header, dan konten halaman.
20. Layout AppSidebar (resources/js/layout/AppSidebar.jsx)
Fungsionalitas
Sidebar navigasi dengan menu utama dan lainnya.
Mendukung submenu dengan animasi.
Menyorot menu aktif berdasarkan rute.
Responsif terhadap state sidebar.
21. Layout Backdrop (resources/js/layout/Backdrop.jsx)
Fungsionalitas
Overlay backdrop saat sidebar mobile terbuka.
Menutup sidebar saat backdrop diklik.
22. Layout SidebarWidget (resources/js/layout/SidebarWidget.jsx)
Fungsionalitas
Widget sidebar statis dengan informasi promosi.
Tombol untuk membeli plan.
Referensi Dokumen Pendukung
SKPPL_MasjidTaqwa.md: Spesifikasi kebutuhan dan perancangan perangkat lunak yang menjelaskan kebutuhan fungsional, use case, dan struktur data.
db_sidontaq.sql: Skema basis data yang mendefinisikan tabel donasi, pengguna, laporan keuangan, pengeluaran, proyek pembangunan, dan lainnya.
Dokumen ini menjadi acuan dalam memahami hubungan antara halaman frontend dengan data dan fungsionalitas backend.
23. Halaman DonaturUserProfile (resources/js/pages/DonaturUserProfile.jsx) Tampilan Halaman profil donatur yang menampilkan informasi pengguna, statistik donasi, dan fitur ganti password. Komponen yang Dipecah
ProfileInfo (resources/js/components/DonaturUserProfile/ProfileInfo.jsx)
DonationStats (resources/js/components/DonaturUserProfile/DonationStats.jsx)
PasswordChange (resources/js/components/DonaturUserProfile/PasswordChange.jsx) Fungsionalitas
Memuat data profil dan statistik donasi dari API.
Mengelola pengeditan nama pengguna.
Mengelola perubahan password dengan validasi.
Menangani navigasi dan logout. Data yang Terlibat
Data profil pengguna dan statistik donasi diambil dari API.
Token otentikasi disimpan di localStorage.

# Database Optimization

Untuk mengoptimalkan performa dan keamanan database, beberapa advanced database features telah diimplementasikan dalam aplikasi ini:

## Database Views

### 1. View `v_donation_summary`

**File Implementasi**: `database/migrations/2025_06_29_160241_create_donation_summary_view.php`

**Deskripsi**: View ini mengumpulkan dan meringkas data donasi bulanan, menghitung total donasi, jumlah donasi yang diterima, pending, dan kadaluarsa, dikelompokkan berdasarkan bulan.

**Implementasi**:
```sql
CREATE VIEW v_donation_summary AS
SELECT 
    COUNT(*) as total_donations,
    SUM(CASE WHEN status = 'Diterima' THEN jumlah ELSE 0 END) as total_accepted,
    SUM(CASE WHEN status = 'Pending' THEN jumlah ELSE 0 END) as total_pending,
    SUM(CASE WHEN status = 'Kadaluarsa' THEN jumlah ELSE 0 END) as total_expired,
    DATE_FORMAT(created_at, '%Y-%m') as donation_month
FROM donasi
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
```

**Model**: `app/Models/DonationSummary.php`

**Controller**: `app/Http/Controllers/DonationSummaryController.php`

**Endpoints API**:
- `/api/donation-summary/monthly` - Mendapatkan ringkasan donasi bulanan
- `/api/donation-summary/chart` - Mendapatkan data chart donasi bulanan

**Keuntungan**:
- Mengurangi beban komputasi di aplikasi
- Menyederhanakan query kompleks
- Memastikan konsistensi data untuk semua fitur yang menggunakan data yang sama
- Meningkatkan performa dengan mengoptimalkan query di level database

## Stored Procedures

### 1. Procedure `validate_donation`

**File Implementasi**: `database/migrations/2025_06_29_160313_create_donation_validation_procedure.php`

**Deskripsi**: Procedure ini menangani validasi dan pembaruan status donasi dengan memastikan integritas data. Mencakup pembaruan laporan keuangan terkait saat status donasi berubah.

**Implementasi**:
```sql
CREATE PROCEDURE validate_donation(IN donation_id VARCHAR(255), IN new_status VARCHAR(50))
BEGIN
    DECLARE current_status VARCHAR(50);
    DECLARE donation_amount DECIMAL(15,2);
    DECLARE report_id VARCHAR(255);
    
    -- Get current status, amount, and report ID
    SELECT status, jumlah, laporan_keuangan_id 
    INTO current_status, donation_amount, report_id 
    FROM donasi 
    WHERE donasi_id = donation_id;
    
    -- Only process if status is different
    IF current_status != new_status THEN
        -- Update status
        UPDATE donasi SET status = new_status WHERE donasi_id = donation_id;
        
        -- If accepting donation, update related financial report
        IF new_status = 'Diterima' AND current_status != 'Diterima' AND report_id IS NOT NULL THEN
            UPDATE laporan_keuangan 
            SET total_pemasukan = total_pemasukan + donation_amount
            WHERE laporan_keuangan_id = report_id;
        
        -- If cancelling an accepted donation, subtract from financial report
        ELSEIF new_status != 'Diterima' AND current_status = 'Diterima' AND report_id IS NOT NULL THEN
            UPDATE laporan_keuangan 
            SET total_pemasukan = total_pemasukan - donation_amount
            WHERE laporan_keuangan_id = report_id;
        END IF;
    END IF;
END
```

**Controller**: Digunakan di `app/Http/Controllers/DonasiController.php` dalam metode `validateDonationUsingProcedure()`

**Endpoint API**: `/api/admin/donations/{id}/validate-procedure` (memerlukan autentikasi)

**Keuntungan**:
- Memastikan validasi donasi dilakukan secara konsisten dan atomic
- Mencegah inkonsistensi data antara donasi dan laporan keuangan
- Mengurangi kemungkinan error saat menangani transaksi kompleks

## Persiapan untuk Optimasi Lebih Lanjut

Implementasi database view dan stored procedure adalah langkah awal dalam optimasi database. Fitur database lanjutan yang dapat diimplementasikan selanjutnya meliputi:

1. **Triggers** - Untuk otomatisasi proses seperti update status donasi
2. **Event Schedulers** - Untuk menjalankan pengecekan donasi kadaluarsa secara otomatis
3. **Database Functions** - Untuk perhitungan kompleks seperti progress percentage donasi

Dengan memanfaatkan advanced database features, aplikasi SIDONTAQ akan mendapatkan keuntungan dalam hal:
- Performa yang lebih baik
- Integritas data yang lebih terjamin
- Konsistensi business logic di seluruh aplikasi
- Keamanan data yang lebih tinggi
- Kemudahan maintenance dan debugging