import React from 'react';

const StatisticsSection = ({ stats, loading, formatCurrency }) => {
  return (
    <div className="bg-white py-16 select-none">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
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
                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
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
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 flex flex-col justify-between min-h-[140px]"
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
                  <h3 className="text-lg font-medium text-gray-700">{item.title}</h3>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 truncate whitespace-nowrap">
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
  );
};

export default StatisticsSection; 