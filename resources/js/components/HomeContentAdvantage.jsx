import React from "react";

const HomePage = () => {
  const iconSrc = "/8fbf169d-fc54-47da-a5cc-38481edbff44.jpg"; // Ganti jika lokasi file berbeda

  const cards = [
    {
      title: "Informasi mengenai pembangunan Masjid",
      desc: "dipasang di website milik Masjid",
    },
    {
      title: "Laporan transparansi",
      desc: "terkait donasi yang diterima oleh masjid.",
    },
    {
      title: "Informasi keuangan masjid",
      desc: "secara transparan penerimaan infaq, zakat dan donasi",
    },
    {
      title: "Informasi mengenai pembangunan Masjid",
      desc: "dipasang di website milik Masjid",
    },
  ];

  return (
    <div className="w-full">
      {/* Keunggulan SIDONTAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Keunggulan SIDONTAQ
          </h2>
          <p className="text-gray-600">
            Donasi lebih mudah, transparan, dan aman untuk mendukung pembangunan
            Masjid Taqwa Muhammadiyah.
          </p>
        </div>

        <div className="mt-10 max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center transition-transform hover:scale-105 duration-300"
            >
              <img src={iconSrc} alt="Icon" className="w-14 h-14 mb-4" />
              <p className="font-semibold text-gray-700">{item.title}</p>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
