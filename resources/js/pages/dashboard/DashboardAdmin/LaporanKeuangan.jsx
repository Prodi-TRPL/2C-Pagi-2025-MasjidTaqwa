import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTable,
  faCalendarAlt,
  faMoneyBillWave,
  faHandHoldingUsd,
  faExchangeAlt,
  faChartLine,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

const LaporanKeuangan = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("bulanan"); // Default filter: bulanan
  const [summary, setSummary] = useState({
    total_pemasukan: 0,
    total_pengeluaran: 0,
    total_saldo: 0,
  });

  // Filter options
  const filterOptions = [
    { value: "harian", label: "Harian" },
    { value: "bulanan", label: "Bulanan" },
    { value: "tahunan", label: "Tahunan" },
  ];

  const fetchReports = async (selectedFilter) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/laporan-keuangan?filter=${selectedFilter}`);
      setReports(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching laporan keuangan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(filter);
  }, [filter]);

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  // Format currency to Indonesian Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get title based on filter
  const getFilterTitle = () => {
    switch (filter) {
      case "harian":
        return "Laporan Keuangan Harian";
      case "tahunan":
        return "Laporan Keuangan Tahunan";
      default:
        return "Laporan Keuangan Bulanan";
    }
  };

  // Get period column title based on filter
  const getPeriodColumnTitle = () => {
    switch (filter) {
      case "harian":
        return "Tanggal";
      case "tahunan":
        return "Tahun";
      default:
        return "Bulan";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          <FontAwesomeIcon icon={faChartLine} className="mr-2 text-blue-600" />
          Laporan Keuangan
        </h1>
        <p className="text-gray-600">
          Lihat dan analisis ringkasan keuangan donasi dan pengeluaran masjid
          berdasarkan periode yang Anda pilih
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Pemasukan Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-2">
            <div className="rounded-full p-3 bg-green-100">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="text-green-600"
              />
            </div>
            <h2 className="ml-3 text-gray-600 text-sm font-medium">
              Total Pemasukan
            </h2>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatRupiah(summary.total_pemasukan)}
          </div>
        </div>

        {/* Total Pengeluaran Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-2">
            <div className="rounded-full p-3 bg-red-100">
              <FontAwesomeIcon
                icon={faHandHoldingUsd}
                className="text-red-600"
              />
            </div>
            <h2 className="ml-3 text-gray-600 text-sm font-medium">
              Total Pengeluaran
            </h2>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatRupiah(summary.total_pengeluaran)}
          </div>
        </div>

        {/* Total Saldo Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-2">
            <div className="rounded-full p-3 bg-blue-100">
              <FontAwesomeIcon icon={faExchangeAlt} className="text-blue-600" />
            </div>
            <h2 className="ml-3 text-gray-600 text-sm font-medium">
              Total Saldo
            </h2>
          </div>
          <div
            className={`text-2xl font-bold ${
              summary.total_saldo >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatRupiah(summary.total_saldo)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 md:mb-0">
            <FontAwesomeIcon icon={faTable} className="mr-2 text-blue-600" />
            {getFilterTitle()}
          </h2>

          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex items-center mb-3 md:mb-0 md:mr-4">
              <FontAwesomeIcon
                icon={faFilter}
                className="text-gray-500 mr-2"
              />
              <span className="text-sm text-gray-600">Filter:</span>
            </div>
            <div className="flex space-x-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    filter === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center">
              Belum ada data laporan keuangan untuk filter yang dipilih.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="mr-2 text-gray-500"
                      />
                      {getPeriodColumnTitle()}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faMoneyBillWave}
                        className="mr-2 text-green-500"
                      />
                      Pemasukan
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faHandHoldingUsd}
                        className="mr-2 text-red-500"
                      />
                      Pengeluaran
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faExchangeAlt}
                        className="mr-2 text-blue-500"
                      />
                      Saldo
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.periode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatRupiah(report.total_pemasukan)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {formatRupiah(report.total_pengeluaran)}
                    </td>
                    <td
                      className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                        report.saldo >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatRupiah(report.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaporanKeuangan;
