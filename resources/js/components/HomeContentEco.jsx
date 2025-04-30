import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { faMosque, faBuilding, faMobileAlt, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const data = [
    {
        icon: <FontAwesomeIcon icon={faMosque} />,
        title: "Fitur Donasi",
        desc: "Memudahkan donatur dalam berdonasi secara transparan untuk pembangunan dan operasional masjid.",
    },
    {
        icon: <FontAwesomeIcon icon={faBuilding} />,
        title: "Pembangunan Masjid",
        desc: "Informasi progres pembangunan dan laporan dana terkini.",
    },
    {
        icon: <FontAwesomeIcon icon={faMobileAlt} />,
        title: "Mobile Donatur",
        desc: "Kemudahan akses donasi dan riwayat kontribusi dalam satu aplikasi.",
    },
    {
        icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
        title: "Manajemen Pengeluaran",
        desc: "Kemudahan pengelolaan dana pembangunan dan operasional masjid secara transparan.",
    },
];

const EcosystemSidontaqWithBg = () => {
    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
        });
    }, []);

    return (
        <section className="bg-green-900 py-20 text-white">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ecosystem SIDONTAQ</h2>
                <p className="text-lg max-w-2xl mx-auto mb-12">
                    Sistem donasi terintegrasi untuk menciptakan ekosistem digital yang memudahkan donatur dalam berkontribusi dan mendukung pembangunan masjid secara transparan.
                </p>
                <div className="w-full max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {data.map((item, index) => (
                    <div
                    key={index}
                    data-aos="fade-up"
                    data-aos-delay={index * 150}
                    className={`flex flex-col items-center text-center space-y-4 transition-transform duration-300 hover:scale-105 p-4 ${
                        data.length === 4 && index === 3 ? 'lg:col-start-2' : ''
                    } group`}
                    >
                    <div className="w-16 h-16 bg-green-600 rotate-45 flex items-center justify-center border-2 border-white shadow-lg transition-all duration-300 group-hover:bg-white group-hover:border-green-600 group-hover:scale-110">
                        <div className="-rotate-45 text-white text-2xl transition-all duration-300 group-hover:text-green-600">
                        {item.icon}
                        </div>
                    </div>
                    <h3 className="text-white text-xl font-bold">{item.title}</h3>
                    <p className="text-white text-sm max-w-xs">{item.desc}</p>
                    </div>
                ))}
                </div>
            </div>
        </section>
    );
};

export default EcosystemSidontaqWithBg;
