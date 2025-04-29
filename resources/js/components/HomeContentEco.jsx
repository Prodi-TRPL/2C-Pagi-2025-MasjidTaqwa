import React from 'react';

const EcosystemSidontaq = () => {
    return (
        <section className="bg-green-800 text-white py-16 px-6">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ecosystem SIDONTAQ</h2>
                <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto">
                    Ekosistem digital yang terintegrasi untuk memudahkan pengelolaan donasi masjid secara transparan.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Donatur */}
                    <div className="bg-green-600 rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
                        <img src="#" alt="Donatur" className="w-14 h-14 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Donatur</h3>
                        <p className="text-white text-sm">
                            Menyumbang dengan mudah dan aman melalui sistem digital.
                        </p>
                    </div>

                    {/* Masjid */}
                    <div className="bg-green-600 rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
                        <img src="#" alt="Masjid" className="w-14 h-14 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Masjid</h3>
                        <p className="text-white text-sm">
                            Mengelola dana, pembangunan, dan laporan secara efisien.
                        </p>
                    </div>

                    {/* Laporan */}
                    <div className="bg-green-600 rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
                        <img src="#" alt="Laporan" className="w-14 h-14 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Laporan</h3>
                        <p className="text-white text-sm">
                            Menyediakan laporan keuangan secara real-time dan transparan.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EcosystemSidontaq;
