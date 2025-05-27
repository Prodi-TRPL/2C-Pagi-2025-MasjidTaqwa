import React, { useState } from "react";

export default function KategoriPengeluaran() {
  const [kategoriList, setKategoriList] = useState([
    { kategori_pengeluaran_id: "KT001", nama_kategori: "Santunan Sosial" },
    { kategori_pengeluaran_id: "KT002", nama_kategori: "Donasi Bencana Alam" },
    { kategori_pengeluaran_id: "KT003", nama_kategori: "Perbaikan AC Masjid" },
    { kategori_pengeluaran_id: "KT004", nama_kategori: "Perbaikan bangunan" },
    { kategori_pengeluaran_id: "KT005", nama_kategori: "Listrik dan Air" },
  ]);
  const [namaKategori, setNamaKategori] = useState("");

  const handleTambah = (e) => {
    e.preventDefault();
    const newId = `KT00${kategoriList.length + 1}`;
    const newItem = {
      kategori_pengeluaran_id: newId,
      nama_kategori: namaKategori,
    };
    setKategoriList([...kategoriList, newItem]);
    setNamaKategori("");
  };

  const handleHapus = (id) => {
    if (!window.confirm("Yakin ingin menghapus?")) return;
    setKategoriList(kategoriList.filter((item) => item.kategori_pengeluaran_id !== id));
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-2xl font-semibold mb-6">Data Kategori Pengeluaran</h2>

      <form onSubmit={handleTambah} className="flex mb-6">
        <input
          type="text"
          placeholder="Nama Kategori"
          className="flex-grow border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={namaKategori}
          onChange={(e) => setNamaKategori(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 rounded-r hover:bg-green-600 transition"
        >
          Tambah
        </button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Nama Kategori</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {kategoriList.map((item) => (
            <tr key={item.kategori_pengeluaran_id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{item.kategori_pengeluaran_id}</td>
              <td className="border border-gray-300 px-4 py-2">{item.nama_kategori}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  onClick={() => handleHapus(item.kategori_pengeluaran_id)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
          {kategoriList.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center py-4">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
