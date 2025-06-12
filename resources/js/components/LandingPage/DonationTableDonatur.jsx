// resources/js/components/DonationTableDonatur.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Pastikan ini sudah di-import di root
import 'primereact/resources/primereact.min.css';

const DonationTableDonatur = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/donations')
      .then(response => {
        setDonations(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching donations:', error);
        setLoading(false);
      });
  }, []);

  const jumlahBodyTemplate = (rowData) => {
    return `Rp${parseInt(rowData.jumlah).toLocaleString()}`;
  };

  return (
    <div className="p-4">
      <h2 className="text-x2l font-semibold mb-4">Daftar Donasi</h2>
      <DataTable
        value={donations}
        loading={loading}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
        stripedRows
        emptyMessage="Tidak ada data donasi."
      >
        <Column field="id" header="ID" style={{ width: '10%' }} />
        <Column field="donatur" header="Donatur" style={{ width: '20%' }} />
        <Column field="tanggal" header="Tanggal" style={{ width: '20%' }} />
        <Column field="jumlah" header="Jumlah" body={jumlahBodyTemplate} style={{ width: '20%' }} />
        <Column field="metode_pembayaran" header="Metode Pembayaran" style={{ width: '30%' }} />
      </DataTable>
    </div>
  );
};

export default DonationTableDonatur;

