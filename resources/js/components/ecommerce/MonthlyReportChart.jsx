import Chart from "react-apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MonthlyReportChart() {
    const [isOpen, setIsOpen] = useState(false);
    const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    const [incomes, setIncomes] = useState(Array(12).fill(0));
    const [expenses, setExpenses] = useState(Array(12).fill(0));

    useEffect(() => {
        axios.get("http://localhost:8000/api/monthly-amount")
            .then((res) => {
                setIncomes(res.data.incomes);
                setExpenses(res.data.expenses);
            })
            .catch((err) => console.error(err));
    }, []);


    const options = {
    colors: ["#22c55e", "#ef4444"], // Hijau (Pemasukan), Merah (Pengeluaran)
    chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 180,
        toolbar: {
        show: false,
        },
    },
    plotOptions: {
        bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
        },
    },
    dataLabels: { enabled: false },
    stroke: {
        show: true,
        width: 4,
        colors: ["transparent"],
    },
    xaxis: {
        categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontFamily: "Outfit",
    },
    yaxis: {
        title: { text: undefined },
    },
    grid: {
        yaxis: {
        lines: { show: true },
        },
    },
    fill: { opacity: 1 },
    tooltip: {
        x: { show: false },
        y: {
        formatter: (val) => `${val}`,
        },
    },
    };


const series = [
    { name: "Pemasukan", data: incomes },
    { name: "Pengeluaran", data: expenses },
];

    function toggleDropdown() {
        setIsOpen(!isOpen);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Pemasukan Dan Pengeluaran Masjid Taqwa Muhammadiyah</h3>
                <div className="relative inline-block">
                    <button className="dropdown-toggle" onClick={toggleDropdown}>
                        <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
                    </button>
                    <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
                        <DropdownItem onItemClick={closeDropdown} className="text-left">View More</DropdownItem>
                        <DropdownItem onItemClick={closeDropdown} className="text-left">Delete</DropdownItem>
                    </Dropdown>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
                    <Chart options={options} series={series} type="bar" height={180} />
                </div>
            </div>
        </div>
    );
}
