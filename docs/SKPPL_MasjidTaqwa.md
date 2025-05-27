# SPESIFIKASI KEBUTUHAN DAN PERANCANGAN PERANGKAT LUNAK

Sistem Informasi Manajemen Donasi Pembangunan Masjid Taqwa Muhammadiyah Batam Kota

Dipersiapkan oleh:  
4342401067  Muhammad Thariq Syafruddin  
4342401071  Ibra Marioka  
4342401073  Diva Satria  
4342401076  Muhammad Addin  
4342401074  Surya Nur Aini  
4342401083  Nayla Nur Nabila  

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)  
   1.1 [Tujuan](#11-tujuan)  
   1.2 [Lingkup Masalah](#12-lingkup-masalah)  
   1.3 [Definisi, Akronim dan Singkatan](#13-definisi-akronim-dan-singkatan)  
   1.4 [Aturan Penamaan dan Penomoran](#14-aturan-penamaan-dan-penomoran)  
   1.5 [Referensi](#15-referensi)  
   1.6 [Ikhtisar Dokumen](#16-ikhtisar-dokumen)  
2. [Deskripsi Umum Perangkat Lunak](#2-deskripsi-umum-perangkat-lunak)  
   2.1 [Deskripsi Umum Sistem](#21-deskripsi-umum-sistem)  
   2.2 [Proses Bisnis Sistem](#22-proses-bisnis-sistem)  
   2.3 [Karakteristik Pengguna](#23-karakteristik-pengguna)  
   2.4 [Batasan](#24-batasan)  
   2.5 [Rancangan Lingkungan Implementasi](#25-rancangan-lingkungan-implementasi)  
3. [Deskripsi Rinci Kebutuhan](#3-deskripsi-rinci-kebutuhan)  
   3.1 [Deskripsi Fungsional](#31-deskripsi-fungsional)  
      3.1.1 [Use Case Diagram](#311-use-case-diagram)  
      3.1.2 [Use Case <nama use case>](#312-use-case-nama-use-case)  
   3.2 [Deskripsi Kebutuhan Non Fungsional](#32-deskripsi-kebutuhan-non-fungsional)  
4. [Deskripsi Kelas-Kelas](#4-deskripsi-kelas-kelas)  
   4.1 [Class Diagram](#41-class-diagram)  
   4.2 [Class <nama class>](#42-class-nama-class)  
   4.3 [Class <nama class> dan seterusnya](#43-class-nama-class-dan-seterusnya)  
   4.4 [State Machine Diagram](#44-state-machine-diagram)  
5. [Deskripsi Data](#5-deskripsi-data)  
   5.1 [Entity-Relationship Diagram](#51-entity-relationship-diagram)  
   5.2 [Daftar Tabel](#52-daftar-tabel)  
   5.3 [Struktur Tabel <nama tabel>](#53-struktur-tabel-nama-tabel)  
   5.4 [Struktur Tabel <nama tabel> dan seterusnya](#54-struktur-tabel-nama-tabel-dan-seterusnya)  
   5.5 [Skema Relasi Antar Tabel](#55-skema-relasi-antar-tabel)  
6. [Perancangan Antarmuka](#6-perancangan-antarmuka)  
   6.1 [Antarmuka <nama antarmuka>](#61-antarmuka-nama-antarmuka)  
   6.2 [Antarmuka <nama antarmuka> dan seterusnya](#62-antarmuka-nama-antarmuka-dan-seterusnya)  
7. [Matriks Keterunutan](#7-matriks-keterunutan)  

---

## 1. Pendahuluan

Pembangunan Masjid Taqwa Muhammadiyah Batam Kota merupakan proyek yang bertujuan untuk menyediakan tempat ibadah yang lebih nyaman dan representatif bagi masyarakat sekitar. Untuk mendukung penggalangan dana yang transparan dan efisien, diperlukan sistem berbasis web yang memudahkan masyarakat dalam berdonasi dan memantau perkembangan dana serta progres pembangunan. Aplikasi ini juga akan memudahkan panitia masjid dalam mengelola dana dan laporan keuangan secara transparan.

### 1.1 Tujuan

Dokumen ini disusun untuk mendefinisikan kebutuhan dan spesifikasi perangkat lunak Aplikasi Informasi Manajemen Donasi Pembangunan Masjid Taqwa Muhammadiyah Batam Kota. Aplikasi ini bertujuan untuk membantu pengelolaan donasi secara transparan dan sistematis, sehingga mempermudah pencatatan pemasukan dan pengeluaran dana serta menyediakan laporan keuangan yang akurat. Spesifikasi Kebutuhan dan Perancangan Perangkat Lunak (SKPPL) ini dibuat untuk menjelaskan kebutuhan sistem secara rinci agar pengembang memiliki pemahaman yang jelas mengenai fitur dan fungsionalitas yang harus disediakan. Dokumen ini juga berfungsi sebagai acuan utama dalam proses pengembangan, pengujian, dan implementasi aplikasi agar sesuai dengan kebutuhan pengguna. Selain itu, SKPPL memastikan transparansi dalam perancangan sistem dengan mendokumentasikan spesifikasi perangkat lunak yang diperlukan. Dengan adanya dokumen ini, komunikasi antara pemangku kepentingan seperti panitia masjid, pengembang, dan pihak terkait lainnya dapat berjalan lebih efektif, sehingga semua pihak memiliki persepsi yang sama terhadap sistem yang akan dibangun. SKPPL juga berperan dalam mempermudah evaluasi serta perbaikan di masa mendatang dengan menyediakan referensi yang lengkap mengenai sistem.

### 1.2 Lingkup Masalah

Dokumen ini membahas produk sistem yang bernama Sistem Informasi Manajemen Donasi Pembangunan Masjid Taqwa Muhammadiyah Batam Kota. Aplikasi ini dirancang untuk mempermudah pengelolaan donasi pembangunan masjid dengan cara yang lebih transparan, teratur, dan mudah diakses oleh semua pihak yang terlibat. Dengan adanya sistem ini, pengurus masjid tidak lagi perlu mencatat secara manual atau menyebarkan proposal bantuan dengan cara konvensional. Sebagai gantinya, mereka dapat mengunggah informasi secara daring untuk menjangkau lebih banyak calon donatur[1].

Penggunaan sistem informasi berbasis web juga memungkinkan pengelolaan keuangan yang lebih akurat dan efisien, sekaligus meminimalkan kesalahan pencatatan yang sering terjadi dalam sistem manual[2].

Selain itu, digitalisasi sistem informasi manajemen masjid modern menjadi sangat penting untuk memberikan pelayanan optimal kepada jamaah, serta membantu pengurus dalam menyelesaikan masalah operasional rutin dengan lebih cepat dan terstruktur[3].

Informasi Manajemen Donasi Pembangunan Masjid Taqwa Muhammadiyah Batam Kota memiliki sejumlah kemampuan utama yang dirancang untuk memudahkan pengelolaan donasi. Sistem ini mampu mencatat dan mengelola donasi secara daring, di mana data donasi akan tersimpan secara otomatis di dalam sistem. Laporan keuangan disajikan secara transparan agar donatur dapat memantau perkembangan pembangunan secara langsung. Tersedia pula halaman khusus yang memuat informasi terbaru mengenai proyek pembangunan masjid. Donatur dapat mengakses portal pribadi mereka untuk melihat riwayat donasi kapan saja. Selain itu, sistem memberikan notifikasi otomatis kepada donatur yang telah login, berupa informasi terkait laporan keuangan dan perkembangan pembangunan masjid. Bagi pengurus masjid, disediakan dashboard admin untuk memudahkan pengelolaan data donasi, laporan keuangan, dan informasi keuangan lainnya. Sejalan dengan hal tersebut, sistem informasi berbasis web juga telah terbukti dapat mengatasi masalah ketidakefisienan dan ketidakteraturan dalam pencatatan manual pada pengelolaan keuangan masjid[4].

Namun demikian, sistem ini memiliki keterbatasan. Sistem hanya menangani donasi yang berkaitan dengan pembangunan masjid dan tidak mencakup transaksi lain seperti pengeluaran operasional. Selain itu, sistem hanya mendukung metode pembayaran tertentu, yaitu transfer bank, dompet digital (GoPay, OVO, Dana), QRIS, dan kartu kredit melalui simulator.

Penerapan sistem ini memberikan berbagai keuntungan bagi semua pihak yang terlibat. Transparansi menjadi lebih baik karena donatur dapat langsung mengakses laporan keuangan dan perkembangan pembangunan, sehingga menumbuhkan rasa percaya terhadap pengelolaan dana. Pengelolaan donasi juga menjadi lebih mudah berkat fitur pencarian dan penyaringan data yang cepat, mengurangi beban kerja manual serta meminimalkan risiko kesalahan pencatatan. Kemudahan donasi menjadi nilai tambah karena para donatur dapat memberikan sumbangan dari mana saja dan kapan saja tanpa harus datang langsung ke masjid. Hal ini selaras dengan tujuan berbagai sistem informasi masjid modern yang dibangun untuk mengakomodasi efisiensi, keterbukaan, dan partisipasi publik secara daring[5]. Sistem yang rapi dan transparan turut meningkatkan kepercayaan donatur terhadap pengurus, mendorong partisipasi donasi yang lebih besar. Selain itu, sistem membantu pengurus dalam merencanakan penggunaan dana secara lebih efektif karena informasi pemasukan dan pengeluaran disajikan dengan akurat dan mutakhir. Salah satu studi menekankan bahwa struktur sistem informasi yang jelas dengan pelaporan real-time akan meningkatkan akuntabilitas dan efisiensi anggaran masjid[6].

Tujuan utama dari sistem ini adalah untuk membantu pengurus masjid dalam mengelola donasi dengan cara yang efisien, transparan, dan akuntabel. Sasaran pengguna sistem ini meliputi pengurus masjid sebagai admin sistem, para donatur yang ingin berkontribusi dan memantau penggunaan donasi mereka, serta masyarakat umum yang ingin mengetahui perkembangan pembangunan masjid. Manfaat yang dirasakan antara lain adalah meningkatnya efisiensi pengelolaan donasi karena pencatatan dilakukan secara otomatis, meningkatnya transparansi dan akuntabilitas melalui laporan keuangan yang dapat diakses publik, serta kemudahan akses informasi bagi donatur melalui portal pribadi. Selain itu, sistem ini meningkatkan kepercayaan donatur, membantu pengurus dalam perencanaan keuangan yang lebih tepat sasaran, mengurangi risiko kesalahan pencatatan manual, dan mendukung kolaborasi antara donatur, pengurus, serta masyarakat melalui keterbukaan informasi pembangunan. Sebagaimana dijelaskan dalam penelitian terkait pengembangan sistem YukAmal, integrasi teknologi seperti REST API dan penggunaan modul donasi secara daring sangat mendukung kemudahan akses dan pemantauan informasi pembangunan [7].

### 1.3 Definisi, Akronim dan Singkatan

- Donatur: Individu atau organisasi yang memberikan donasi untuk pembangunan Masjid Taqwa Muhammadiyah Batam Kota.  
- SKPPL: Spesifikasi Kebutuhan dan Perancangan Perangkat Lunak  
- UML: Unified Modelling Language  
- ERD: Entity Relationship Diagram  
- DBMS: Database Management System  
- F: Fungsional  
- NF: Non Fungsional  
- UC: Use Case  

### 1.4 Aturan Penamaan dan Penomoran

1. Kebutuhan Perangkat Lunak  
   - Deskripsi Fungsional → F-XXX  
   - Deskripsi Kebutuhan Non-Fungsional → NF-XXX  
2. Use Case  
   - Use Case → UC-XXX  
   - Interaksi Objek → UC-XXX-INT-YYY  
3. Deskripsi Kelas-Kelas  
   - Class → CLS-XXX  
   - State Machine Diagram (jika ada) → STD-XXX  
4. Deskripsi Data  
   - Daftar Tabel → TBL-XXX  
   - Struktur Tabel → Mengikuti kode tabel (misal, tabel "Users" → TBL-001, maka atribut di dalamnya tetap mengikuti)  
   - Skema Relasi Antar Tabel → REL-XXX  
5. Perancangan Antarmuka  
   - Antarmuka → UI-XXX  

### 1.5 Referensi

Dokumen ini merujuk pada beberapa sumber sebagai acuan dalam penyusunannya, yaitu:

[1] N. Ardi, “Rancang Bangun Sistem Informasi Donasi Pembangunan Masjid Di Kota Batam Berbasis Web,” p. 69, 2019.  
[2] B. Harto, “Jurnal J – Click Jurnal J – Click,” J-Click, vol. 8, no. 1, pp. 32–41, 2021.  
[3] Sutono, Ai Musrifah, and Repi Maulana Risyan, “Digitalisasi Sistem Informasi Manajemen Masjid Modern,” INFOTECH J., vol. 9, no. 1, pp. 1–10, 2023, doi: 10.31949/infotech.v9i1.4222.  
[4] I. Faishal Sugiyartomo and I. Aknuranda, “Pengembangan Sistem Informasi Keuangan Masjid untuk Bidang Keuangan Fuqara Wa Masakin dan Pembangunan Masjid (Kasus: Masjid Ibnu Sina Jl. Veteran, Malang),” vol. 5, no. 3, pp. 1055–1064, 2021, [Online]. Available: http://j-ptiik.ub.ac.id  
[5] A. Mujahid, M. Y. Abdullah, S. Suharya, and A. R. Adriansyah, “Analisis dan Pengembangan Sistem Informasi Pengelolaan Masjid berbasis Mobile dengan Teknologi API Web Service,” J. Inform. Terpadu, vol. 7, no. 2, pp. 80–86, 2021, doi: 10.54914/jit.v7i2.368.  
[6] D. Almansah, “Rancang Bangun Sistem Informasi Manajemen Masjid Pada Masjid Al-Falah Menggunakan Metode Activity- Based Budgeting”.  
[7] L. M. F. Aksara, I. Bagus, G. Pala, A. Nurhalisa, and A. Ningtias, “Rancang Bangun Sistem Informasi Donasi Masjid Kota Kendari Berbasis Website,” J. Ilm. Komputasi, vol. 22, no. 1, pp. 81–94, 2023, doi: 10.32409/jikstik.22.1.3340.  

Referensi tambahan yang digunakan dalam pengembangan Aplikasi Informasi Manajemen Donasi Pembangunan Masjid Taqwa Muhammadiyah Batam Kota antara lain:

1. eMasjid | Software Aplikasi Masjid Terbaik  
2. Kitabisa - Donasi, Zakat, Wakaf, dan Saling Jaga se-Indonesia  
3. Yayasan Masjid Al Ikhlas (YMAI Peduli)  

### 1.6 Ikhtisar Dokumen

Dokumen ini terdiri dari beberapa bagian utama:  
1. Pendahuluan – Berisi tujuan, lingkup masalah, dan definisi penting.  
2. Kebutuhan Fungsional dan Non-Fungsional – Menjelaskan fitur yang harus tersedia dalam aplikasi.  
3. Model UML – Diagram visual yang menggambarkan sistem.  
4. Desain Sistem – Penjabaran teknis mengenai data, arsitektur, dan antarmuka aplikasi.  
5. Pengujian dan Implementasi – Menjelaskan metode pengujian yang akan digunakan serta rencana implementasi sistem.  
6. Referensi – Daftar dokumen dan sumber yang dijadikan acuan.  

Dokumen ini juga mencakup proses transformasi dari model UML menjadi rancangan sistem yang siap diimplementasikan. Selain itu, dijelaskan pula bagaimana sistem diuji dan diimplementasikan agar sesuai dengan kebutuhan pengguna. Jika terdapat notasi tambahan selain UML, akan dijelaskan pada bagian yang sesuai.

---

## 2. Deskripsi Umum Perangkat Lunak

Sistem Informasi Manajemen Donasi Pembangunan Masjid Taqwa Muhammadiyah Batam Kota merupakan perangkat lunak berbasis web yang dirancang untuk mempermudah panitia dalam mengelola donasi secara daring. Sistem ini memungkinkan masyarakat memberikan donasi dengan lebih mudah dan transparan, serta membantu panitia dalam pencatatan, pelaporan, dan pengelolaan dana pembangunan masjid.

### 2.1 Deskripsi Umum Sistem

Sistem Manajemen Donasi Pembangunan Masjid Taqwa adalah platform digital yang dirancang untuk mempermudah pengelolaan dan pencatatan donasi secara transparan dan efisien. Sistem ini mencatat setiap transaksi donasi melalui metode pembayaran digital serta menyediakan laporan keuangan otomatis yang dapat diakses oleh panitia dan donatur. Dengan adanya dasbor administrasi, panitia dapat memantau jumlah dana yang masuk serta mengelola pengeluaran. Selain itu, sistem ini dilengkapi dengan fitur notifikasi untuk mengingatkan donatur serta memberikan pembaruan perkembangan proyek. Dengan akses yang fleksibel melalui situs web atau aplikasi, sistem ini memastikan proses donasi menjadi lebih mudah, aman, dan akuntabel, sehingga dapat meningkatkan partisipasi masyarakat dalam pembangunan Masjid Taqwa.

### 2.2 Proses Bisnis Sistem

Sistem Manajemen Donasi Pembangunan Masjid Taqwa dirancang untuk mengotomatisasi dan menyederhanakan alur donasi, pencatatan, serta pelaporan keuangan. Proses bisnis dalam sistem ini mencakup beberapa tahapan utama, yaitu pendaftaran donatur, pengelolaan donasi, pemantauan dana, dan pelaporan secara transparan kepada pihak terkait.

1. Pendaftaran Donatur  
   Donatur dapat mendaftar melalui platform dengan mengisi data pribadi seperti nama, email, atau nomor kontak.  
2. Proses Donasi  
   Donatur memilih nominal donasi dan metode pembayaran yang tersedia dalam bentuk simulator. Setelah pembayaran dikonfirmasi, sistem secara otomatis mencatat transaksi dan mengirimkan bukti donasi melalui email.  
3. Pencatatan & Verifikasi Dana  
   Setiap transaksi yang masuk akan diverifikasi oleh sistem atau panitia administrasi untuk memastikan kesesuaian jumlah dana yang diterima. Sistem mencatat setiap donasi dalam basis data, lengkap dengan informasi donatur, tanggal, dan metode pembayaran.  
4. Pemantauan & Manajemen Dana  
   Panitia dan donatur dapat mengakses dasbor untuk melihat total donasi yang masuk dan dana yang telah digunakan. Sistem juga memungkinkan panitia untuk mengelola kategori pengeluaran seperti pembelian material, administrasi, dan biaya operasional lainnya.  
5. Laporan Keuangan & Transparansi  
   Secara berkala, sistem akan menghasilkan laporan keuangan yang dapat diakses oleh panitia. Donatur juga dapat melihat progres pembangunan dan bagaimana dana yang mereka donasikan digunakan.  
6. Notifikasi & Pengingat Donasi  
   Sistem mengirimkan notifikasi otomatis kepada donatur terkait status donasi.  

Dengan sistem ini, proses bisnis pengelolaan donasi menjadi lebih efektif, transparan, dan mudah diaudit, sehingga dapat meningkatkan kepercayaan masyarakat serta mempercepat pembangunan Masjid Taqwa.

### 2.3 Karakteristik Pengguna

| Pengguna | Tanggung Jawab | Hak Akses Aplikasi | Kemampuan yang harus dimiliki |
|----------|----------------|--------------------|------------------------------|
| Donatur  | Melakukan donasi | Donatur dapat mengakses daftar donasi mereka beserta detail transaksi untuk transparansi. | Memahami cara melakukan donasi melalui aplikasi |
| Admin    | Mengatur pemasukan dan pengeluaran | Admin hanya dapat mengelola pemasukan dan pengeluaran tanpa akses ke pengaturan sistem. | Mampu mencatat transaksi keuangan dengan teliti |

### 2.4 Batasan

1. Sistem hanya dapat digunakan untuk donasi terkait pembangunan Masjid Taqwa Muhammadiyah Batam Kota.  
2. Hanya admin yang dapat mengelola dan mengedit laporan donasi.  
3. Sistem ini memerlukan koneksi internet untuk beroperasi karena data donasi, transaksi keuangan, dan informasi lainnya akan disimpan dan diproses secara terpusat di server.  

### 2.5 Rancangan Lingkungan Implementasi

Agar sistem Manajemen Donasi Pembangunan Masjid Taqwa berjalan secara optimal, diperlukan lingkungan implementasi yang mencakup perangkat keras, perangkat lunak, jaringan, dan sumber daya manusia.

1. Perangkat Keras  
   - Server Cloud/VPS untuk hosting sistem dan database.  
   - Komputer/Laptop bagi admin untuk mengelola donasi.  
   - Smartphone/Tablets bagi donatur untuk mengakses sistem.  
2. Perangkat Lunak  
   - Sistem Operasi: Windows, Linux, atau macOS.  
   - Database: MySQL/PostgreSQL untuk penyimpanan data.  
   - Framework: Laravel untuk pengembangan backend.  
   - Frontend: React untuk pengembangan antarmuka web  
   - Payment Gateway: Integrasi dengan QRIS, Midtrans, atau Xendit.  
3. Jaringan & Keamanan  
   - Koneksi Internet Stabil untuk akses sistem.  
   - Enkripsi SSL & Firewall untuk menjamin keamanan data.  
   - Backup & Recovery untuk perlindungan informasi penting.  
4. Sumber Daya Manusia  
   - Admin: Mengawasi transaksi dan laporan donasi.  
   - Tim IT: Memantau serta memelihara performa sistem.  
   - Donatur: Mengakses sistem untuk melakukan donasi.  
5. Metode Implementasi  
   1. Pengujian Sistem untuk memastikan stabilitas dan fungsionalitas, termasuk unit testing, black-box testing, dan performance testing.  
   2. Uji Coba Beta dengan melibatkan sejumlah donatur sebelum peluncuran penuh.  
   3. Pelatihan Pengguna bagi admin.  
   4. Implementasi Bertahap sebelum peluncuran penuh.  
   5. Monitoring & Evaluasi untuk perbaikan berkelanjutan.  
   6. Pengumpulan umpan balik dari pengguna awal sebagai dasar penyempurnaan sistem.  

---

## 3. Deskripsi Rinci Kebutuhan

Aplikasi ini bertujuan untuk memfasilitasi pengelolaan donasi yang diterima untuk pembangunan Masjid Taqwa Muhammadiyah Batam Kota. Aplikasi ini akan memungkinkan pengurus masjid untuk mencatat, memantau, dan melaporkan donasi secara transparan kepada masyarakat.
   2. Deskripsi Fungsional
Kode
	Kebutuhan Fungsional
	F001
	Sistem dapat memungkinkan donatur untuk mendaftar, serta memungkinkan donatur, dan admin untuk masuk menggunakan email dan kata sandi yang telah terdaftar.
	F002
	Sistem dapat menyediakan opsi pemulihan password melalui email untuk donatur, dan admin.
	F003
	Sistem dapat memungkinkan donatur untuk melakukan donasi melalui berbagai metode pembayaran digital, yang saat ini masih dalam bentuk simulasi tanpa transaksi nyata
	F004
	Sistem dapat memungkinkan admin untuk mencatat pengeluaran yang dibutuhkan dalam pembangunan masjid, termasuk jenis pengeluaran, jumlah biaya, tanggal, dan keterangan tambahan.
	F005
	Sistem dapat menyajikan ringkasan laporan donasi dalam bentuk data tabel dan grafik pada dashboard admin, yang mencakup informasi total donasi dan aktivitas donatur berdasarkan periode harian, mingguan, dan bulanan.
	F006
	Sistem dapat menyediakan grafik visualisasi data donasi untuk analisis yang lebih baik, termasuk total donasi dan jumlah donatur, yang dapat diakses oleh donatur, dan admin.
	F007
	Sistem dapat menyediakan halaman informasi mengenai proyek pembangunan masjid, termasuk tujuan, anggaran, dan progres pembangunan, yang dapat diperbarui oleh admin serta dapat dilihat oleh donatur.
	F008
	Sistem dapat memungkinkan donatur untuk melihat riwayat donasi yang telah dilakukan.
	

      1. Use Case Diagram
  

      2. Use Case Melakukan Registrasi
         1. Skenario Melakukan Registrasi
Identifikasi
	Nomor
	UC001
	Nama
	Melakukan Registrasi
	Tujuan
	Memungkinkan donatur untuk mendaftarkan akun baru agar dapat login ke dalam sistem.
	Deskripsi
	Fitur ini memungkinkan donatur untuk mendaftar sebagai pengguna baru dengan mengisi data diri seperti nama, email atau nomor telepon, dan password. Setelah proses registrasi berhasil, donatur akan memiliki akun yang dapat digunakan untuk login ke dalam sistem dan mengakses fitur yang tersedia.
	Aktor
	Donatur
	Skenario Utama
	Kondisi Awal
	Donatur belum memiliki akun dan berada di halaman utama aplikasi.
	Aksi Aktor


	Reaksi Sistem
	1. Donatur membuka halaman registrasi
	Sistem menampilkan form registrasi
	2. Donatur mengisi nama, email/nomor telepon, dan password
	Sistem melakukan validasi data yang diinput
	3. Donatur menekan tombol "Daftar"
	Jika data valid dan belum terdaftar, sistem menyimpan data dan menampilkan notifikasi "Pendaftaran berhasil", Jika data tidak valid, sistem menampilkan pesan kesalahan yang sesuai
	Skenario Alternatif
	Aksi Aktor
	Reaksi Sistem
	Donatur mencoba untuk melakukan pendaftaran dengan email atau nomor telepon yang sudah terdaftar.
	Sistem menampilkan pesan "Email atau nomor telepon sudah digunakan. Silakan login." dan memberikan link ke halaman login.
	Donatur mengisi kolom registrasi dengan data yang tidak lengkap atau format salah (misalnya, email tidak valid).
	Sistem menampilkan pesan "Mohon lengkapi semua kolom dengan format yang benar." dan menyoroti kolom yang bermasalah.
	Kondisi Akhir
	Donatur berhasil terdaftar dan bisa login menggunakan akun tersebut di masa depan.
	

      3. Use Case Melakukan Login
         1. Skenario Melakukan Login
Identifikasi
	Nomor
	UC002
	Nama
	Melakukan Login
	Tujuan
	Memungkinkan pengguna (donatur dan admin) untuk login ke dalam sistem menggunakan email/nomor telepon dan password.
	Deskripsi
	Fitur ini memungkinkan donatur, dan admin dapat melakukan login ke dalam sistem menggunakan email atau nomor telepon yang telah mereka daftarkan.
	Aktor
	1. Donatur
2. Admin
	Skenario Utama
	Kondisi Awal
	1. Pengguna sudah memiliki akun yang terdaftar.
2. Pengguna berada di halaman utama aplikasi.
	Aksi Aktor


	Reaksi Sistem
	1. Pengguna membuka halaman login.
	Sistem menampilkan form login
	2. Pengguna mengisi email atau nomor telepon dan password.
	Sistem memvalidasi data yang dimasukkan.
	3. Pengguna menekan tombol "Login"
	Sistem memverifikasi email/nomor telepon dan password.
	4. Pengguna menekan tombol "Daftar" atau "Login".
	Jika valid, sistem menyimpan data pengguna dan menampilkan notifikasi "Pendaftaran berhasil" atau mengarahkan ke dashboard. Jika tidak valid, sistem menampilkan pesan error.
	Skenario Alternatif
	Aksi Aktor
	Reaksi Sistem
	Pengguna lupa password dan memilih opsi "Lupa Password".
	Sistem akan mengirimkan email untuk reset password dan meminta pengguna membuat password baru.
	Kondisi Akhir
	1. Pengguna berhasil login ke sistem sesuai perannya.
2. Jika registrasi, pengguna mendapatkan akun yang dapat digunakan untuk login di lain waktu.
	

      4. Use Case Melakukan Pemulihan Password
         1. Skenario Melakukan Pemulihan Password
Identifikasi
	Nomor
	UC003
	Nama
	Melakukan Pemulihan Password
	Tujuan
	Memungkinkan pengguna (donatur, admin) untuk memulihkan password melalui email.
	Deskripsi
	Jika pengguna lupa password, mereka dapat menggunakan fitur pemulihan password untuk mendapatkan akses kembali ke akun mereka.
	Aktor
	1. Donatur
2. Admin
	Skenario Utama
	Kondisi Awal
	1. Pengguna lupa password dan berada di halaman login.
	Aksi Aktor


	Reaksi Sistem
	1. Pengguna memilih opsi "Lupa Password".
	Sistem menampilkan halaman pemulihan password.
	2. Pengguna memasukkan email yang terdaftar.
	Sistem memverifikasi apakah email tersebut valid.
	3. Pengguna menekan tombol "Reset".
	Jika email valid, sistem mengirimkan link reset password ke email tersebut.
	4. Pengguna membuka email dan mengklik link reset.
	Sistem menampilkan halaman untuk membuat password baru.
	5. Pengguna memasukkan password baru dan mengkonfirmasinya.
	Sistem menyimpan password baru dan menampilkan notifikasi "Password berhasil diubah".
	Skenario Alternatif
	Aksi Aktor
	Reaksi Sistem
	Pengguna memasukkan email yang tidak terdaftar.
	Sistem menampilkan pesan error "Email tidak ditemukan".
	Kondisi Akhir
	Pengguna berhasil mengatur ulang password dan dapat login kembali.
	

      5. Use Case Melakukan Donasi
         1. Skenario Melakukan Donasi
Identifikasi
	Nomor
	UC004
	Nama
	Melakukan Donasi
	Tujuan
	Memungkinkan donatur melakukan donasi melalui metode pembayaran digital.
	Deskripsi
	Donatur dapat memilih metode pembayaran (QRIS, transfer bank, e-wallet) untuk melakukan donasi dalam bentuk simulasi tanpa transaksi nyata.
	Aktor
	Donatur
	Skenario Utama
	Kondisi Awal
	Donatur telah login ke sistem dan berada di halaman donasi.
	Aksi Aktor


	Reaksi Sistem
	1. Donatur memilih jumlah donasi dan metode pembayaran.
	Sistem menampilkan informasi pembayaran.
	2. Donatur mengonfirmasi donasi.
	Sistem menampilkan simulasi transaksi tanpa pembayaran nyata.
	3. Donatur menyelesaikan proses donasi.
	Sistem mencatat transaksi dan menampilkan notifikasi sukses.
	Skenario Alternatif
	Aksi Aktor
	Reaksi Sistem
	Donatur membatalkan transaksi sebelum konfirmasi.
	Sistem membatalkan transaksi tanpa mencatatnya.
	Kondisi Akhir
	Donasi tercatat di sistem dan dapat dilihat di riwayat donasi.
	

      6. Use Case Mencatatan Pengeluaran
         1. Skenario Mencatatan Pengeluaran
Identifikasi
	Nomor
	UC005
	Nama
	Mencatatan Pengeluaran
	Tujuan
	Memungkinkan admin mencatat pengeluaran pembangunan masjid.
	Deskripsi
	Admin dapat mencatat jenis pengeluaran, jumlah biaya, tanggal, dan keterangan tambahan.
	Aktor
	Admin
	Skenario Utama
	Kondisi Awal
	Admin telah login ke sistem.
	Aksi Aktor


	Reaksi Sistem
	1. Admin membuka halaman pencatatan pengeluaran.
	Sistem menampilkan form pengeluaran.
	2. Admin mengisi form (jenis pengeluaran, jumlah, tanggal, keterangan).
	Sistem memvalidasi data.
	3. Admin menyimpan data.
	Sistem menyimpan pengeluaran dan menampilkan notifikasi sukses.
	Skenario Alternatif
	Aksi Aktor
	Reaksi Sistem
	Admin memasukkan data tidak valid.
	Sistem menampilkan pesan error.
	Kondisi Akhir
	Data pengeluaran tersimpan dan dapat dilihat dalam laporan.
	

      7. Use Case Menyusun Laporan Donasi
         1. Skenario Menyusun Laporan Donasi
Identifikasi
	Nomor
	UC006
	Nama
	Menyusun Laporan Donasi
	Tujuan
	Memungkinkan admin mengunduh laporan donasi dalam format PDF.
	Deskripsi
	Laporan donasi dapat diunduh berdasarkan periode tertentu (harian, mingguan, atau bulanan) untuk keperluan pencatatan dan transparansi.
	Aktor
	

1. Admin
	Skenario Utama
	Kondisi Awal
	Admin telah login ke sistem.
	Aksi Aktor


	Reaksi Sistem
	1. Admin membuka halaman laporan donasi.
	Sistem menampilkan opsi filter periode laporan (harian, mingguan, bulanan).
	2. Admin memilih periode laporan yang diinginkan.
	Sistem menampilkan pratinjau laporan donasi.
	3. Admin menekan tombol "Unduh Laporan".
	Sistem menghasilkan file PDF berisi laporan donasi.
	4. Admin menyimpan file laporan.
	Sistem menampilkan notifikasi sukses.
	Skenario Alternatif
	Aksi Aktor
	Reaksi Sistem
	Tidak ada data donasi dalam periode yang dipilih.
	Sistem menampilkan pesan "Tidak ada data donasi untuk periode ini".
	Kondisi Akhir
	Laporan donasi berhasil diunduh dalam format PDF.
	

      8. Use Case Melihat Visualisasi Data Donasi
         1. Skenario Melihat Visualisasi Data Donasi
Identifikasi
	Nomor
	UC007
	Nama
	Melihat Visualisasi Data Donasi
	Tujuan
	Menyediakan grafik visualisasi donasi untuk analisis yang lebih baik.
	Deskripsi
	Data donasi ditampilkan dalam bentuk grafik yang dapat diakses oleh semua aktor.
	Aktor
	1. Donatur
2. Admin
	Skenario Utama
	Kondisi Awal
	Pengguna telah login ke sistem dan berada di halaman dashboard.
	Aksi Aktor


	Reaksi Sistem
	1. Pengguna membuka halaman visualisasi data donasi.
	Sistem menampilkan grafik donasi berdasarkan periode waktu.
	2. Pengguna memilih filter periode waktu tertentu (harian, mingguan, bulanan, tahunan).
	Sistem memperbarui tampilan grafik sesuai filter yang dipilih.
	Skenario Alternatif
	Aksi Aktor
	Reaksi Sistem
	Tidak ada data donasi dalam periode yang dipilih.
	Sistem menampilkan pesan "Tidak ada data donasi untuk periode ini".
	Kondisi Akhir
	Data donasi divisualisasikan dalam bentuk grafik yang interaktif.
	

      9. Use Case Melihat Informasi Proyek
         1. Skenario Melihat Informasi Proyek
Identifikasi
	Nomor
	UC008
	Nama
	Melihat Informasi Proyek
	Tujuan
	Menyediakan informasi pembangunan masjid yang dapat diperbarui oleh admin.
	Deskripsi
	Informasi proyek mencakup tujuan, anggaran, dan progres pembangunan, yang dapat diakses oleh donatur dan diperbarui oleh admin.
	Aktor
	1. Donatur 
2. Admin
	Skenario Utama
	Kondisi Awal
	Admin telah login ke sistem.
	Aksi Aktor


	Reaksi Sistem
	1. Admin membuka halaman informasi proyek.
	Sistem menampilkan daftar proyek pembangunan masjid.
	2. Admin memilih proyek yang ingin diperbarui.
	Sistem menampilkan form edit proyek.
	3. Admin mengedit informasi proyek (tujuan, anggaran, progres, deskripsi).
	Sistem memvalidasi data yang diinputkan.
	4. Admin menyimpan perubahan.
	Sistem menyimpan data dan memperbarui halaman informasi proyek.
	Skenario Alternatif
	Aksi Aktor
	Reaksi Sistem
	Admin memasukkan data tidak valid.
	Sistem menampilkan pesan error sesuai validasi input.
	Kondisi Akhir
	Informasi proyek berhasil diperbarui dan dapat dilihat oleh donatur.
	

      10. Use Case Melihat Riwayat Donasi
         1. Skenario Melihat Riwayat Donasi
Identifikasi
	Nomor
	UC009
	Nama
	Melihat Riwayat Donasi
	Tujuan
	Memungkinkan donatur melihat riwayat donasi mereka.
	Deskripsi
	Donatur dapat melihat daftar donasi yang telah mereka lakukan, termasuk tanggal, jumlah, dan metode pembayaran.
	Aktor
	Donatur
	Skenario Utama
	Kondisi Awal
	Donatur telah login ke sistem.
	Aksi Aktor


	Reaksi Sistem
	1. Donatur membuka halaman riwayat donasi.
	Sistem menampilkan daftar donasi yang telah dilakukan.
	2. Donatur memilih salah satu transaksi untuk melihat detailnya.
	Sistem menampilkan detail transaksi (tanggal, jumlah, metode pembayaran).
	Skenario Alternatif
	Aksi Aktor
	Reaksi Sistem
	Donatur belum pernah melakukan donasi.
	Sistem menampilkan pesan "Belum ada donasi yang dilakukan".
	Kondisi Akhir
	Donatur dapat melihat riwayat donasi mereka dengan detail.
	

         2. Interaksi Objek


   3. Deskripsi Kebutuhan Non Fungsional


Kode
	Parameter 
	Kebutuhan 
	NF001
	Ketersediaan Sistem
	Sistem dapat diakses oleh pengguna kapan saja selama tidak ada gangguan teknis.
	NF002
	Skalabilitas
	Sistem mudah dikembangkan jika jumlah pengguna meningkat.
	NF003
	Usability
	Antarmuka mudah digunakan oleh pengguna tanpa pelatihan khusus.
	NF004
	Performansi
	Sistem dapat menangani transaksi harian dengan lancar.
	NF005
	Modus Operasi
	Sistem dapat diakses melalui browser di perangkat desktop dan mobile.
	NF006
	Ergonomi
	Tampilan antarmuka menyesuaikan ukuran layar (mobile, tablet, dan desktop).
	NF007
	Keamanan
	Sistem dapat memastikan hanya pengguna terdaftar yang dapat login menggunakan email/nomor telepon dan password yang valid.
	

4. Deskripsi Kelas-Kelas
Sistem donasi Masjid Taqwa Muhammadiyah Batam Kota terdiri dari beberapa kelas utama. Kelas Pengguna menyimpan data donatur dan admin. Kelas Donasi mencatat transaksi donasi, termasuk jumlah, status, tanggal, serta terhubung ke pengguna, metode pembayaran, dan laporan keuangan. Metode Pembayaran menyimpan pilihan seperti transfer bank atau e-wallet. Kelas Laporan Keuangan mencatat ringkasan pemasukan dan pengeluaran selama periode tertentu. Untuk pengeluaran, kelas Pengeluaran mencatat detail penggunaan dana dan dikategorikan melalui Kategori Pengeluaran. Seluruh kelas ini saling terhubung membentuk sistem yang terstruktur dan transparan.
Bagian ini mendeskripsikan kelas-kelas yang disarikan dari berbagai objek yang teridentifikasi. Deskripsi kelas ini terdiri atas diagram kelas yang menggambarkan struktur statis antar kelas dan spesifikasi setiap kelasnya. 
   4. Class Diagram
Class diagram sistem donasi Masjid Taqwa Muhammadiyah Batam Kota terdiri dari kelas Pengguna, Donasi, Laporan Keuangan, Metode Pembayaran, dan Kategori Pengeluaran. Kelas Pengguna menyimpan data donatur, sementara Donasi mencatat transaksi donasi lengkap dengan jumlah, status, tanggal, serta terhubung ke pengguna, laporan keuangan, dan metode pembayaran. Laporan Keuangan. mengelompokkan pemasukan dan pengeluaran, yang jenisnya ditentukan oleh Kategori Pengeluaran. Relasi antar kelas memungkinkan sistem mengelola donasi secara rapi, akuntabel, dan mudah ditelusuri.
  

   5. Class <Pengguna>
Nama Kelas: Pengguna


Nama Atribut
	Visibility (private, public)
	Tipe 
	pengguna_id
	private
	int
	nama
	private
	string
	email
	private
	string
	password
	private
	string
	no_hp
	private
	string
	role
	public
	string
	created_at
	private
	enum
	



Nama Operasi
	Visibility (private, public)
	Keterangan 
	login() 
	public


	Memverifikasi email dan password untuk login
	logout()
	public
	menghapus sesi pengguna dan keluar dari sistem
	updateProfil()
	public
	Mengubah data profil pengguna seperti nama, email, dan no hp
	

   6. Class <Donasi>
Cantumkan dan beri penjelasan kelas kedua dan seterusnya. Beri judul yang sesuai dengan Nama Kelas yang dijelaskan. 
Nama Kelas: Donasi
Nama Atribut
	Visibility (private, public)
	Tipe 
	donasi_id
	private
	int
	pengguna_id
	private
	int
	metode_pembayaran_id
	public
	int
	jumlah
	public
	float
	tanggal_donasi
	private
	date
	status
	public
	string
	



Nama Operasi
	Visibility (private, public)
	Keterangan 
	buatDonasi()
	public


	Membuat donasi baru dan menyimpan ke database dengan status “menunggu”
	lihatStatusDonasi()
	public
	Menampilkan daftar donasi milik pengguna dan statusnya
	

   7. Class <Metode Pembayaran>
Nama Kelas: Metode Pembayaran
Nama Atribut
	Visibility (private, public)
	Tipe 
	metode_pembayaran_id
	private
	int
	nama_metode
	private
	string
	



Nama Operasi
	Visibility (private, public)
	Keterangan 
	tampilkanMetode()
	public


	Menampilkan semua metode pembayaran yang bisa dipilih pengguna.
	



   8. Class <Laporan Keuangan>
Nama Kelas: Laporan Keuangan
Nama Atribut
	Visibility (private, public)
	Tipe 
	laporan_keuangan_id
	private
	int
	periode
	private
	string
	total_pemasukan
	private
	float
	total_pengeluaran
	private
	float
	saldo
	private
	float
	created_at
	private
	datetime
	



Nama Operasi
	Visibility (private, public)
	Keterangan 
	generateLaporan
	public


	Membuat donasi baru dan menyimpan ke database dengan status “menunggu”
	hitungSaldo
	private
	Operasi internal untuk menjumlahkan total donasi dan pengeluaran selama periode laporan
	

   9. Class <Pengeluaran>
Nama Kelas: Pengeluaran
Nama Atribut
	Visibility (private, public)
	Tipe 
	pengeluaran_id
	private
	int
	kategori_pengeluaran_id
	private
	int
	jumlah
	private
	float
	tanggal_pengeluaran
	private
	date
	nama_pengeluaran
	private
	string
	keterangan
	private
	string
	status_validasi
	private
	bool
	



Nama Operasi
	Visibility (private, public)
	Keterangan 
	tambahPengeluaran
	public


	Menambahkan data pengeluaran baru ke dalam sistem
	editPengeluaran
	public
	Mengubah atau memperbarui data pengeluaran
	simpanPengeluaran
	public
	Menyimpan data pengeluaran 
	validasiPengeluaran
	private
	Mengecek data pengeluaran sebelum disimpan, seperti tanggal dan jumlah
	

   10. Class <Katagori Pengeluaran>
Nama Kelas: Katagori Pengeluaran
Nama Atribut
	Visibility (private, public)
	Tipe 
	katagori_pengeluaran_id
	private
	int
	nama_katagori
	private
	var
	



Nama Operasi
	Visibility (private, public)
	Keterangan 
	tampilkanKategori
	public


	Menampilkan daftar kategori pengeluaran yang bisa dipilih admin/staff.
	tambahKategori
	public
	Menambahkan kategori baru untuk digunakan saat mencatat pengeluaran
	

   11. Class <Notifikasi>
Nama Kelas: Notifikasi
Nama Atribut
	Visibility (private, public)
	Tipe 
	notifikasi_id
	private
	int
	tipe
	private
	string
	pesan
	private
	string
	status
	private
	string
	created_at
	private
	datetime
	



Nama Operasi
	Visibility (private, public)
	Keterangan 
	kirimNotifikasi
	public


	Mengirim notifikasi ke pengguna tertentu, misalnya status donasi atau pengingat pembayaran.
	formatPesan
	private
	Digunakan internal untuk mengatur format pesan sebelum dikirimkan.
	

   12. Class <Proyek Pembangunan>
Nama Kelas: Proyek Pembangunan
Nama Atribut
	Visibility (private, public)
	Tipe 
	proyek_id
	private
	int
	nama_proyek
	private
	string
	deskripsi
	private
	string
	dana_terkumpul
	private
	float
	target_dana
	private
	float
	created_at
	private
	datetime
	



Nama Operasi
	Visibility (private, public)
	Keterangan 
	ubahstatusProyek
	public
	Memperbarui status atau deskripsi dari proyek yang sedang berjalan
	tambahProyek
	public


	Menambahkan proyek pembangunan masjid ke sistem.
	

   13. State Machine Diagram

### 4.10 State Machine Diagram

*(State Machine Diagram placeholder)*

---

## 5. Deskripsi Data

### 5.1 Entity-Relationship Diagram

*(Entity-Relationship Diagram placeholder)*

### 5.2 Daftar Tabel

Berikut adalah daftar tabel utama dalam basis data Sistem Informasi Manajemen Donasi Pembangunan Masjid Taqwa:

1. donasi - Menyimpan data transaksi donasi  
2. kategori_pengeluaran - Menyimpan kategori pengeluaran  
3. laporan_keuangan - Menyimpan laporan keuangan per periode  
4. metode_pembayaran - Menyimpan metode pembayaran yang tersedia  
5. notifikasi - Menyimpan notifikasi untuk pengguna  
6. pengeluaran - Menyimpan data pengeluaran pembangunan  
7. pengguna - Menyimpan data pengguna (donatur dan admin)  
8. personal_access_tokens - Menyimpan token akses pribadi untuk autentikasi  
9. proyek_pembangunan - Menyimpan data proyek pembangunan masjid  

### 5.3 Struktur Tabel donasi

| Field               | Tipe Data                      | Keterangan                          |  
|---------------------|--------------------------------|-----------------------------------|  
| donasi_id           | char(36)                      | ID unik donasi (PK)                |  
| pengguna_id         | char(36)                      | ID pengguna (FK)                   |  
| laporan_keuangan_id  | char(36)                      | ID laporan keuangan (FK)           |  
| jumlah              | decimal(15,2)                 | Jumlah donasi                     |  
| metode_pembayaran_id | char(36)                      | ID metode pembayaran (FK)          |  
| status              | enum('Menunggu','Diterima','Kadaluarsa') | Status donasi                    |  
| tanggal_donasi      | timestamp                    | Tanggal donasi                    |  

### 5.4 Struktur Tabel kategori_pengeluaran dan seterusnya

#### kategori_pengeluaran

| Field               | Tipe Data                      | Keterangan                          |
|---------------------|--------------------------------|-----------------------------------|
| kategori_pengeluaran_id | char(36)                   | ID unik kategori pengeluaran (PK) |
| nama_kategori       | varchar(100)                  | Nama kategori pengeluaran          |

#### laporan_keuangan

| Field               | Tipe Data                      | Keterangan                          |
|---------------------|--------------------------------|-----------------------------------|
| laporan_keuangan_id | char(36)                      | ID unik laporan keuangan (PK)      |
| periode             | date                         | Periode laporan                    |
| total_pemasukan     | decimal(15,2)                | Total pemasukan                   |
| total_pengeluaran   | decimal(15,2)                | Total pengeluaran                 |
| saldo               | decimal(15,2)                | Saldo akhir                      |
| created_at          | timestamp                    | Tanggal pembuatan laporan         |

#### metode_pembayaran

| Field               | Tipe Data                      | Keterangan                          |
|---------------------|--------------------------------|-----------------------------------|
| metode_pembayaran_id | char(36)                     | ID unik metode pembayaran (PK)    |
| nama_metode         | varchar(50)                  | Nama metode pembayaran             |

#### notifikasi

| Field               | Tipe Data                      | Keterangan                          |
|---------------------|--------------------------------|-----------------------------------|
| notifikasi_id       | char(36)                     | ID unik notifikasi (PK)            |
| pengguna_id         | char(36)                     | ID pengguna (FK)                   |
| donasi_id           | char(36)                     | ID donasi (FK)                    |
| tipe                | enum('target_tercapai','progres_pembangunan','donasi_diterima') | Tipe notifikasi |
| pesan               | text                         | Isi pesan notifikasi              |
| status              | enum('terkirim','dibaca')    | Status notifikasi                 |
| created_at          | timestamp                   | Waktu pembuatan notifikasi        |

#### pengeluaran

| Field               | Tipe Data                      | Keterangan                          |
|---------------------|--------------------------------|-----------------------------------|
| pengeluaran_id      | char(36)                     | ID unik pengeluaran (PK)           |
| proyek_id           | char(36)                     | ID proyek pembangunan (FK)         |
| penginput_id        | char(36)                     | ID pengguna penginput (FK)         |
| kategori_pengeluaran_id | char(36)                  | ID kategori pengeluaran (FK)       |
| laporan_keuangan_id | char(36)                     | ID laporan keuangan (FK)           |
| jumlah              | decimal(15,2)                | Jumlah pengeluaran                |
| tanggal_pengeluaran | timestamp                   | Tanggal pengeluaran               |
| nama_pengeluaran    | varchar(255)                 | Nama pengeluaran                  |
| keterangan          | text                         | Keterangan tambahan               |

#### pengguna

| Field               | Tipe Data                      | Keterangan                          |
|---------------------|--------------------------------|-----------------------------------|
| pengguna_id         | char(36)                     | ID unik pengguna (PK)              |
| nama                | varchar(100)                 | Nama pengguna                     |
| email               | varchar(100)                 | Email pengguna                    |
| password            | varchar(255)                 | Password terenkripsi              |
| role                | enum('admin','donatur')      | Peran pengguna                   |
| nomor_hp            | varchar(15)                  | Nomor handphone                  |
| created_at          | timestamp                   | Waktu pembuatan akun             |

#### personal_access_tokens

| Field               | Tipe Data                      | Keterangan                          |
|---------------------|--------------------------------|-----------------------------------|
| id                  | bigint UNSIGNED              | ID unik token (PK)                 |
| tokenable_type      | varchar(255)                 | Tipe tokenable                    |
| tokenable_id        | bigint UNSIGNED              | ID tokenable                     |
| name                | varchar(255)                 | Nama token                      |
| token               | varchar(64)                  | Token akses                     |
| abilities           | text                         | Kemampuan token                 |
| last_used_at        | timestamp                   | Terakhir digunakan              |
| expires_at          | timestamp                   | Kadaluarsa token                |
| created_at          | timestamp                   | Waktu pembuatan token           |
| updated_at          | timestamp                   | Waktu update token              |

#### proyek_pembangunan

| Field               | Tipe Data                      | Keterangan                          |
|---------------------|--------------------------------|-----------------------------------|
| proyek_id           | char(36)                     | ID unik proyek pembangunan (PK)   |
| admin_id            | char(36)                     | ID admin (FK)                     |
| nama_item           | varchar(255)                 | Nama item proyek                  |
| deskripsi           | text                         | Deskripsi proyek                 |
| target_dana         | decimal(15,2)                | Target dana                     |
| dana_terkumpul      | decimal(15,2)                | Dana terkumpul                  |
| created_at          | timestamp                   | Waktu pembuatan proyek          |

### 5.5 Skema Relasi Antar Tabel

*(Skema Relasi Antar Tabel placeholder)*

---

## 6. Perancangan Antarmuka

### 6.1 Antarmuka <nama antarmuka>

*(Antarmuka placeholder)*

### 6.2 Antarmuka <nama antarmuka> dan seterusnya

*(Antarmuka placeholder)*

---

## 7. Matriks Keterunutan

*(Matriks Keterunutan placeholder)*

## 8. Color Pallete
Kategori	Peran	Kode Hex	Deskripsi
🎯 Primary Brand Color	Primary	#59B997	Warna utama brand (toska segar)
🎯	Primary Dark	#3B7F6D	Untuk hover tombol, header, footer
🎯	Primary Light	#8CD2B2	Untuk elemen ringan, icon background
🎯	Primary Extra Light	#DFF3ED	Latar lembut (misalnya form section)

| 📘 Secondary (Aksen) | Secondary | #407C87 | Biru kehijauan untuk keseimbangan |
| 📘 | Secondary Light | #89C0C8 | Background badge/icon |
| 📘 | Secondary Soft | #D6ECEF | Alternatif soft section background |

| ⚪ Neutral (Netral) | Background | #F5FBF8 | Latar utama yang lembut |
| ⚪ | Surface | #FFFFFF | Warna putih bersih |
| ⚪ | Border | #D9E2DC | Untuk garis batas ringan |
| ⚪ | Divider | #B0C4BA | Garis pemisah konten ringan |

| 🔤 Text (Teks) | Text Primary | #222831 | Hitam modern, cocok untuk teks utama |
| 🔤 | Text Secondary | #4E5D58 | Untuk deskripsi/teks pendukung |
| 🔤 | Text Disabled | #A0AFA9 | Placeholder dan teks nonaktif |

| ✨ Aksen & Notifikasi | Accent / Highlight | #F6C453 | Emas pastel untuk CTA penting |
| ✨ | Error | #D94B4B | Merah untuk pesan error |
| ✨ | Success | #4CAF50 | Hijau untuk sukses/berhasil |
| ✨ | Warning | #F7B801 | Kuning untuk peringatan |


## 9. Font Pairing - Elegan dan Mudah Dibaca
| Jenis Teks      | Font Pilihan                                                         | Cadangan     |
| --------------- | -------------------------------------------------------------------- | ------------ |
| **Heading**     | [Poppins](https://fonts.google.com/specimen/Poppins) – Semibold/Bold | `sans-serif` |
| **Body Text**   | [Open Sans](https://fonts.google.com/specimen/Open+Sans) – Regular   | `sans-serif` |
| **Alternative** | Lato, Nunito Sans                                                    |              |
