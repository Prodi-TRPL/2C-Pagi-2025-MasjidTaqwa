import Chart from "react-apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarDay, 
  faCalendarWeek, 
  faCalendarAlt,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

export default function MonthlyReportChart() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState("monthly"); // Options: daily, monthly, yearly
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    
    // Format currency to Indonesian Rupiah
    const formatRupiah = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    // Fetch financial data based on selected period
    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            // Default endpoint for monthly data
            let endpoint = "/api/monthly-amount";
            
            // Add period and date parameters if needed
            const params = { period };
            
            if (period === 'yearly') {
                params.year = year;
            } else if (period === 'monthly') {
                params.year = year;
            } else if (period === 'daily') {
                params.year = year;
                params.month = month;
            }
            
            const response = await axios.get(endpoint, { params });
            
            // Process data based on selected period
            if (period === 'daily') {
                // Daily data within a month
                const daysInMonth = new Date(year, month, 0).getDate();
                setCategories(Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`));
                
                // Initialize daily data arrays
                const dailyIncomes = Array(daysInMonth).fill(0);
                const dailyExpenses = Array(daysInMonth).fill(0);
                
                // If we have real API data, use it; otherwise use this mock implementation
                if (response.data.incomes && response.data.expenses) {
                    setIncomes(response.data.incomes);
                    setExpenses(response.data.expenses);
                } else {
                    // Mock implementation for daily data
                    response.data.donations?.forEach(donation => {
                        const date = new Date(donation.created_at);
                        if (date.getMonth() + 1 === month && date.getFullYear() === year) {
                            const day = date.getDate() - 1;
                            dailyIncomes[day] += parseFloat(donation.jumlah || 0);
                        }
                    });
                    
                    response.data.expenses?.forEach(expense => {
                        const date = new Date(expense.created_at);
                        if (date.getMonth() + 1 === month && date.getFullYear() === year) {
                            const day = date.getDate() - 1;
                            dailyExpenses[day] += parseFloat(expense.jumlah || 0);
                        }
                    });
                    
                    setIncomes(dailyIncomes);
                    setExpenses(dailyExpenses);
                }
            } else if (period === 'yearly') {
                // Yearly data
                setCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
                
                if (response.data.incomes && response.data.expenses) {
                    setIncomes(response.data.incomes);
                    setExpenses(response.data.expenses);
                } else {
                    // Use the raw data if the API doesn't return the processed arrays
                    const monthlyIncomes = Array(12).fill(0);
                    const monthlyExpenses = Array(12).fill(0);
                    
                    response.data.donations?.forEach(donation => {
                        const date = new Date(donation.created_at);
                        if (date.getFullYear() === year) {
                            const month = date.getMonth();
                            monthlyIncomes[month] += parseFloat(donation.jumlah || 0);
                        }
                    });
                    
                    response.data.expenses?.forEach(expense => {
                        const date = new Date(expense.created_at);
                        if (date.getFullYear() === year) {
                            const month = date.getMonth();
                            monthlyExpenses[month] += parseFloat(expense.jumlah || 0);
                        }
                    });
                    
                    setIncomes(monthlyIncomes);
                    setExpenses(monthlyExpenses);
                }
            } else {
                // Default: monthly data (last 12 months)
                setCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
                
                if (response.data.incomes && response.data.expenses) {
                    setIncomes(response.data.incomes);
                    setExpenses(response.data.expenses);
                } else {
                    // If the API doesn't return processed arrays, use empty arrays
                    setIncomes(Array(12).fill(0));
                    setExpenses(Array(12).fill(0));
                }
            }
        } catch (error) {
            console.error("Error fetching financial data:", error);
            // Set default empty data on error
            setIncomes(Array(12).fill(0));
            setExpenses(Array(12).fill(0));
            setCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when component mounts or when period/date filters change
    useEffect(() => {
        fetchFinancialData();
    }, [period, year, month]);

    // Chart options based on period
    const options = {
        colors: ["#22c55e", "#ef4444"], // Green (Income), Red (Expense)
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 350,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                },
                export: {
                    csv: {
                        filename: `financial-data-${period}-${year}${period === 'daily' ? `-${month}` : ''}`,
                    },
                    svg: {
                        filename: `financial-data-${period}-${year}${period === 'daily' ? `-${month}` : ''}`,
                    },
                    png: {
                        filename: `financial-data-${period}-${year}${period === 'daily' ? `-${month}` : ''}`,
                    }
                }
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: period === 'daily' ? '60%' : '50%',
                borderRadius: 5,
                borderRadiusApplication: "end",
                dataLabels: {
                    position: 'top',
                },
            },
        },
        dataLabels: { 
            enabled: false,
            formatter: function (val) {
                return formatRupiah(val);
            },
            offsetY: -20,
            style: {
                fontSize: '10px',
                colors: ["#304758"]
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
        },
        xaxis: {
            categories: categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
            title: {
                text: period === 'daily' ? 'Tanggal' : (period === 'monthly' ? 'Bulan' : 'Bulan'),
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                }
            }
        },
        yaxis: {
            title: {
                text: 'Jumlah (Rp)',
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                }
            },
            labels: {
                formatter: function (val) {
                    return formatRupiah(val);
                }
            }
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
            fontSize: '14px',
            markers: {
                width: 12,
                height: 12,
                radius: 12
            }
        },
        grid: {
            yaxis: {
                lines: { show: true },
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 10
            }
        },
        fill: { opacity: 1 },
        tooltip: {
            y: {
                formatter: (val) => formatRupiah(val),
            },
            theme: 'light',
            style: {
                fontSize: '12px',
                fontFamily: 'Outfit, sans-serif'
            }
        },
    };

    const series = [
        { name: "Pemasukan", data: incomes },
        { name: "Pengeluaran", data: expenses },
    ];

    // Filter options for periods
    const periodOptions = [
        { id: 'daily', label: 'Harian', icon: faCalendarDay },
        { id: 'monthly', label: 'Bulanan', icon: faCalendarWeek },
        { id: 'yearly', label: 'Tahunan', icon: faCalendarAlt }
    ];

    // Year options (last 5 years)
    const yearOptions = Array.from({ length: 5 }, (_, i) => {
        const yearValue = new Date().getFullYear() - i;
        return { id: yearValue, label: yearValue.toString() };
    });

    // Month options
    const monthOptions = [
        { id: 1, label: 'Januari' },
        { id: 2, label: 'Februari' },
        { id: 3, label: 'Maret' },
        { id: 4, label: 'April' },
        { id: 5, label: 'Mei' },
        { id: 6, label: 'Juni' },
        { id: 7, label: 'Juli' },
        { id: 8, label: 'Agustus' },
        { id: 9, label: 'September' },
        { id: 10, label: 'Oktober' },
        { id: 11, label: 'November' },
        { id: 12, label: 'Desember' }
    ];

    function toggleDropdown() {
        setIsOpen(!isOpen);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Pemasukan Dan Pengeluaran Masjid Taqwa Muhammadiyah
                </h3>
                
                <div className="flex flex-wrap items-center gap-2">
                    {/* Period filter */}
                    <div className="flex rounded-md overflow-hidden border border-gray-200">
                        {periodOptions.map(option => (
                            <button
                                key={option.id}
                                className={`px-3 py-2 text-sm font-medium flex items-center ${
                                    period === option.id
                                        ? 'bg-green-50 text-green-700 border-r border-gray-200'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-200'
                                }`}
                                onClick={() => setPeriod(option.id)}
                            >
                                <FontAwesomeIcon icon={option.icon} className="mr-2" />
                                {option.label}
                            </button>
                        ))}
                    </div>
                    
                    {/* Year selector (shown for all periods) */}
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="rounded-md border border-gray-200 px-3 py-2 text-sm"
                    >
                        {yearOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    
                    {/* Month selector (only for daily view) */}
                    {period === 'daily' && (
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
                        >
                            {monthOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center h-[350px]">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-green-500 text-2xl mr-2" />
                        <span className="text-gray-600">Memuat data...</span>
                    </div>
                ) : (
                    <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
                        <Chart 
                            options={options} 
                            series={series} 
                            type="bar" 
                            height={350} 
                        />
                    </div>
                )}
            </div>
            
            {/* Display summary information */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Total Pemasukan</span>
                    <span className="text-lg font-semibold text-green-600">
                        {formatRupiah(incomes.reduce((sum, value) => sum + value, 0))}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Total Pengeluaran</span>
                    <span className="text-lg font-semibold text-red-600">
                        {formatRupiah(expenses.reduce((sum, value) => sum + value, 0))}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Saldo Bersih</span>
                    <span className={`text-lg font-semibold ${
                        incomes.reduce((sum, value) => sum + value, 0) - expenses.reduce((sum, value) => sum + value, 0) >= 0 
                        ? 'text-blue-600' 
                        : 'text-red-600'
                    }`}>
                        {formatRupiah(
                            incomes.reduce((sum, value) => sum + value, 0) - 
                            expenses.reduce((sum, value) => sum + value, 0)
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
