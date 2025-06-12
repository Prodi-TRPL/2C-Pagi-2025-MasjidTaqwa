import React, { useState } from "react";

const Notifikasi = () => {
  const [notifikasiList, setNotifikasiList] = useState([
    {
      id: 1,
      jenis: "Progress Pembangunan",
      judul: "Proyek Masjid mencapai 75%",
      status: "Dibaca",
    },
    {
      id: 2,
      jenis: "Target Proyek Tercapai",
      judul: "Target dana pembangunan telah tercapai.",
      status: "Terkirim",
    },
  ]);

  const [formData, setFormData] = useState({
    jenis: "Progress Pembangunan",
    judul: "",
  });

  const handleTambah = (e) => {
    e.preventDefault();
    const newItem = {
      id: notifikasiList.length + 1,
      ...formData,
      status: "Terkirim",
    };
    setNotifikasiList([newItem, ...notifikasiList]);
    setFormData({ jenis: "Progress Pembangunan", judul: "" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6"> Notifikasi Donatur</h1>

      {/* Form Tambah */}
      <form
        onSubmit={handleTambah}
        className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Buat Notifikasi Manual</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Jenis</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
              style={{ outlineColor: '#59B997' }}
              value={formData.jenis}
              onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
            >
              <option>Progress Pembangunan</option>
              <option>Target Proyek Tercapai</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Isi Pesan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Proyek Masjid telah selesai 100%"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
              style={{ outlineColor: '#59B997' }}
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 px-6 py-2 text-white rounded"
          style={{ backgroundColor: '#59B997' }}
        >
          Kirim ke Semua Donatur
        </button>
      </form>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead style={{ backgroundColor: '#59B997' }} className="text-white">
            <tr>
              <th className="px-4 py-2 text-left">Jenis</th>
              <th className="px-4 py-2 text-left">Pesan</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {notifikasiList.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-400">
                  Tidak ada notifikasi.
                </td>
              </tr>
            ) : (
              notifikasiList.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 border-t border-gray-200 transition"
                >
                  <td className="px-4 py-3">{item.jenis}</td>
                  <td className="px-4 py-3">{item.judul}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === "Terkirim"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Notifikasi;
