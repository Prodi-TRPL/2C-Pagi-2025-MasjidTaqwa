import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  CategoryScale,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  CategoryScale,
  Filler,
  Legend
);

const DonationChartBulanan = () => {
  const [dataPoints, setDataPoints] = useState({ donasi: [], pengeluaran: [] });
  const [labels, setLabels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    const dummyData = [
      { month: "Jan", donasi: 1000000, pengeluaran: 400000 },
      { month: "Feb", donasi: 1200000, pengeluaran: 500000 },
      { month: "Mar", donasi: 900000, pengeluaran: 300000 },
      { month: "Apr", donasi: 1400000, pengeluaran: 1000000 },
      { month: "Mei", donasi: 1100000, pengeluaran: 600000 },
      { month: "Jun", donasi: 1300000, pengeluaran: 700000 },
    ];

    const months = dummyData.map((item) => item.month);
    const donasiData = dummyData.map((item) => item.donasi);
    const pengeluaranData = dummyData.map((item) => item.pengeluaran);

    setLabels(months);
    setDataPoints({ donasi: donasiData, pengeluaran: pengeluaranData });
  }, []);

  const toggleModal = () => setShowModal(!showModal);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const data = {
    labels,
    datasets: [
      {
        label: "Donasi Masuk",
        data: dataPoints.donasi,
        borderColor: "rgba(0, 200, 100, 1)",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(0, 255, 150, 0.4)");
          gradient.addColorStop(1, "rgba(0, 255, 150, 0.05)");
          return gradient;
        },
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
      {
        label: "Pengeluaran",
        data: dataPoints.pengeluaran,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(255, 99, 132, 0.3)");
          gradient.addColorStop(1, "rgba(255, 99, 132, 0.05)");
          return gradient;
        },
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": " +
              context.parsed.y.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              });
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            value.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }),
        },
      },
    },
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-center font-semibold text-xl mb-4">
        Grafik Donasi & Pengeluaran Bulanan
      </h2>

      <div className="h-64">
        <Line data={data} options={options} />
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={toggleModal}
          className="bg-blue-100 text-blue-800 font-medium py-2 px-4 rounded"
        >
          Lihat Detail
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay non-transparan */}
          <div className="absolute inset-0 bg-white opacity-100"></div>

          {/* Modal Content */}
          <div
            ref={modalRef}
            className="relative bg-white p-6 rounded-lg w-full max-w-3xl shadow-xl z-10"
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              Detail Donasi & Pengeluaran
            </h3>

            <table className="w-full mb-4 text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Bulan</th>
                  <th className="p-2 border">Donasi</th>
                  <th className="p-2 border">Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {labels.map((month, index) => (
                  <tr key={index} className="text-center">
                    <td className="p-2 border">{month}</td>
                    <td className="p-2 border">
                      {dataPoints.donasi[index].toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </td>
                    <td className="p-2 border">
                      {dataPoints.pengeluaran[index].toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right">
              <button
                onClick={toggleModal}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationChartBulanan;
