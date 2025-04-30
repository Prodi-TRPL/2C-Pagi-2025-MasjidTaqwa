import React, { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMosque } from '@fortawesome/free-solid-svg-icons';
import {faHandHoldingDollar} from '@fortawesome/free-solid-svg-icons';
import {faMoneyCheck} from '@fortawesome/free-solid-svg-icons';
import {faHelmetSafety} from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const cards = [
    {
      icon: <FontAwesomeIcon icon={faMosque} className="text-3xl" />,
      title: "Profile Masjid",
      desc: "Informasi mengenai Masjid dipasang di website milik Masjid",
    },
    {
      icon: <FontAwesomeIcon icon={faHandHoldingDollar} className="text-3xl" />,
      title: "Laporan Donasi",
      desc: "terkait donasi yang diterima oleh masjid.",
    },
    {
      icon: <FontAwesomeIcon icon={faMoneyCheck} className="text-3xl" />,
      title: "Laporan keuangan",
      desc: "secara transparan penerimaan donasi",
    },
    {
      icon: <FontAwesomeIcon icon={faHelmetSafety} className="text-3xl" />,
      title: "Informasi pembangunan Masjid",
      desc: "dipasang di website milik Masjid",
    },
  ];

  return (
    <div className="w-full">
      {/* Section: Keunggulan SIDONTAQ */}
      <div className="w-full py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Judul */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Keunggulan SIDONTAQ
            </h2>
            <p className="text-gray-600 mt-2">
              Donasi lebih mudah, transparan, dan aman untuk mendukung pembangunan Masjid Taqwa Muhammadiyah.
            </p>
          </div>

          {/* Grid Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((item, idx) => (
              <div
                key={idx}
                data-aos="fade-up"
                data-aos-delay={idx * 150}
                className="group bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center transition-transform hover:scale-105 duration-300"
              >
                <div className="mb-4">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-600 text-white text-2xl transition-all duration-300 ease-in-out group-hover:bg-white group-hover:text-green-600 group-hover:border group-hover:border-green-600">
                    {item.icon}
                  </div>
                </div>
                <p className="font-semibold text-gray-700">{item.title}</p>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
