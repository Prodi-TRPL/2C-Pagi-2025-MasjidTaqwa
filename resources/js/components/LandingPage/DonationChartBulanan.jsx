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
  Legend
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
  const [dataPoints, setDataPoints] = useState([]);
  const [labels, setLabels] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    // Ambil data dari API
    fetch("/api/donation-stats")
      .then((response) => response.json())
      .then((data) => {
        const months = data.map((item) => item.month);
        const totals = data.map((item) => item.total);
        setLabels(months);
        setDataPoints(totals);
      })
      .catch((error) => console.error("Error fetching donation data:", error));
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: "Rp",
        data: dataPoints,
        borderColor: "rgba(0, 123, 255, 1)",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(0, 200, 150, 0.4)");
          gradient.addColorStop(1, "rgba(0, 200, 150, 0.05)");
          return gradient;
        },
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed.y.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR"
            });
            return value;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) =>
            value.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0
            })
        },
        beginAtZero: false
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-center font-semibold text-xl mb-4">
        Rp{dataPoints[dataPoints.length - 1]?.toLocaleString("id-ID")}
      </h2>
      <div className="h-48">
        <Line ref={chartRef} data={data} options={options} />
      </div>
      <div className="mt-4 text-center">
        <button className="bg-blue-100 text-blue-800 font-medium py-2 px-4 rounded">
          Details
        </button>
      </div>
    </div>
  );
};

export default DonationChartBulanan;
