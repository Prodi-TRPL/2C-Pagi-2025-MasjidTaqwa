import React from 'react';

const EcosystemSidontaqWithBg = () => {
    return (
        <section className="bg-green-900 py-20 text-white">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ecosystem SIDONTAQ</h2>
                <p className="text-lg max-w-2xl mx-auto mb-12">
                    Sistem donasi terintegrasi untuk menciptakan ekosistem digital yang memudahkan donatur dalam berkontribusi dan mendukung pembangunan masjid secara transparan.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                    {/* Box 1 - Icon kanan, teks kanan, posisi paling atas */}
                    <div className="flex items-start justify-between gap-4 text-right mt-0">
                        <div className="flex-1">
                            <h3 className="font-semibold text-xl mb-1">Fitur Donasi</h3>
                            <p>Memudahkan donatur dalam berdonasi secara transparan untuk pembangunan dan operasional masjid.</p>
                        </div>
                        <img src="#" alt="" className="w-10 h-10 mt-1" />
                    </div>

                    {/* Box 2 - Icon kiri, teks kiri, agak ke bawah */}
                    <div className="flex items-start gap-4 text-left mt-6">
                        <img src="#" alt="" className="w-10 h-10 mt-1" />
                        <div>
                            <h3 className="font-semibold text-xl mb-1">Pembangunan Masjid</h3>
                            <p>Informasi progres pembangunan dan laporan dana terkini.</p>
                        </div>
                    </div>

                    {/* Box 3 - Icon kanan, teks kanan, lebih ke bawah lagi */}
                    <div className="flex items-start justify-between gap-4 text-right mt-12">
                        <div className="flex-1">
                            <h3 className="font-semibold text-xl mb-1">Mobile Donatur</h3>
                            <p>Kemudahan akses donasi dan riwayat kontribusi dalam satu aplikasi.</p>
                        </div>
                        <img src="#" alt="" className="w-10 h-10 mt-1" />
                    </div>

                    {/* Box 4 - Icon kiri, teks kiri, paling bawah */}
                    <div className="flex items-start gap-4 text-left mt-16">
                        <img src="#" alt="" className="w-10 h-10 mt-1" />
                        <div>
                            <h3 className="font-semibold text-xl mb-1">Manajemen Pengeluaran</h3>
                            <p>Kemudahan pengelolaan dana pembangunan dan operasional masjid secara transparan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EcosystemSidontaqWithBg;
