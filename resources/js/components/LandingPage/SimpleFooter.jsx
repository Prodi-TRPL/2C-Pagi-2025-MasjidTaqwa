import React from "react";

export const SimpleFooter = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-15 pt-16 mt-10 border-t border-gray-300 border-opacity-50">
      <div className="grid gap-16 row-gap-10 mb-8 lg:grid-cols-6">
        <div className="md:max-w-md lg:col-span-2">
          <a
            href="#beranda"
            aria-label="Go home"
            title="SIDONTAQ"
            className="inline-flex items-center"
          >
            <img
              src="/img/LogoSidontaq.png"
              alt="SIDONTAQ Logo"
              className="w-20"
              draggable={false}
            />
            <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
              SIDONTAQ
            </span>
          </a>
          <div className="mt-4 lg:max-w-sm">
            <p className="text-sm text-gray-800">
              Aplikasi yang memberikan layanan utama berupa pengelolaan donasi dan pembangunan masjid dengan berbagai fitur, seperti pencatatan keuangan, transparansi donasi, laporan wakaf, serta kemudahan akses bagi donatur 
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 row-gap-8 lg:col-span-4 md:grid-cols-3">
          <div>
            <p className="font-semibold tracking-wide text-gray-800">
              Beranda
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-600 transition-colors duration-300 hover:text-[#59B997] hover:underline"
                >
                  Halaman Utama
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold tracking-wide text-gray-800">
              Informasi
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="/#tentang"
                  className="text-gray-600 transition-colors duration-300 hover:text-[#59B997] hover:underline"
                >
                  Tentang
                </a>
              </li>
              <li>
                <a
                  href="/#keunggulan"
                  className="text-gray-600 transition-colors duration-300 hover:text-[#59B997] hover:underline"
                >
                  Keunggulan
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold tracking-wide text-gray-800">
              Transparansi
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="/rekapanbulanan"
                  className="text-gray-600 transition-colors duration-300 hover:text-[#59B997] hover:underline"
                >
                  Rekapan Bulanan
                </a>
              </li>
              <li>
                <a
                  href="/rekapandonatur"
                  className="text-gray-600 transition-colors duration-300 hover:text-[#59B997] hover:underline"
                >
                  Rekapan Donatur
                </a>
              </li>
              <li>
                <a
                  href="/distribusi-dana-proyek"
                  className="text-gray-600 transition-colors duration-300 hover:text-[#59B997] hover:underline"
                >
                  Distribusi Dana dan Proyek
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold tracking-wide text-gray-800">
              Hubungi Kami
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="/hubungi"
                  className="text-gray-600 transition-colors duration-300 hover:text-[#59B997] hover:underline"
                >
                  Kontak
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between pt-5 pb-10 border-t sm:flex-row">
        <p className="text-sm text-gray-600">
          ©Copyright 2025 <label className="text-blue-500">Masjid Taqwa Muhammadiyah</label>. All rights reserved.
        </p>
        <div className="flex items-center mt-4 space-x-4 sm:mt-0">
          {/* Icon Instagram */}
          <a
            href="/"
            className="text-gray-500 transition-colors duration-300 hover:text-[#59B997]"
          >
            <svg viewBox="0 0 30 30" fill="currentColor" className="h-6">
              <circle cx="15" cy="15" r="4" />
              <path d="M19.999,3h-10C6.14,3,3,6.141,3,10.001v10C3,23.86,6.141,27,10.001,27h10C23.86,27,27,23.859,27,19.999v-10   C27,6.14,23.859,3,19.999,3z M15,21c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S18.309,21,15,21z M22,9c-0.552,0-1-0.448-1-1   c0-0.552,0.448-1,1-1s1,0.448,1,1C23,8.552,22.552,9,22,9z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
