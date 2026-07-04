import { useEffect, useState, useMemo } from "react";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import Card from "../components/Card";
import { sampleProducts } from "../data/sampleProducts";
import { sampleSales } from "../data/sampleSales";
import { sampleSaleItems } from "../data/sampleSaleItems";

const Dashboard = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [chartData, setChartData] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState("week");
  const [profitPeriod, setProfitPeriod] = useState("week");
  const [totalSales, setTotalSales] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const navigate = useNavigate();
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [profitChartData, setProfitChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saleItems, setSaleItems] = useState(sampleSaleItems);
  const [sales, setSales] = useState(sampleSales);
  const [todayProfit, setTodayProfit] = useState(0);

  function getProfit(sale) {
    // If your backend has profit already:
    if (sale.profit !== undefined) return Number(sale.profit);

    // fallback assumption (30% margin)
    return Number(sale.total || 0) * 0.3;
  }
  function fetchBestSellers() {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const items = {};

    saleItems.forEach((item) => {
      if (!item.created_at) return;

      const date = new Date(item.created_at);

      // only today
      if (date < startOfDay) return;

      const product = sampleProducts.find((p) => p.id === item.product_id);
      if (!product) return;

      if (!items[product.id]) {
        items[product.id] = {
          id: product.id,
          name: product.name,
          quantity: 0,
          revenue: 0,
        };
      }

      const qty = Number(item.quantity || 0);
      const price = Number(item.selling_price || 0);

      items[product.id].quantity += qty;
      items[product.id].revenue += qty * price;
    });

    setBestSellers(
      Object.values(items).sort((a, b) => b.quantity - a.quantity),
    );
  }

  function fetchProfitChart() {
    const grouped = {};
    const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    week.forEach((d) => (grouped[d] = 0));

    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);

    saleItems.forEach((item) => {
      const sale = sales.find((s) => Number(s.id) === Number(item.sale_id));

      // ❗ FIX: ignore deleted/missing sales
      if (!sale || sale.deleted) return;

      const date = new Date(sale.created_at);
      if (date < start) return;

      const day = week[date.getDay()];

      const profit =
        (Number(item.selling_price || 0) - Number(item.cost_price || 0)) *
        Number(item.quantity || 0);

      grouped[day] += profit;
    });

    setProfitChartData(
      week.map((d) => ({
        name: d,
        profit: Number(grouped[d].toFixed(2)),
      })),
    );
  }

  function fetchTodayProfit() {
    const today = new Date().toDateString();

    const total = saleItems.reduce((sum, item) => {
      const sale = sales.find((s) => Number(s.id) === Number(item.sale_id));

      // ❗ FIX: skip deleted/missing sales
      if (!sale || sale.deleted) return sum;

      if (new Date(sale.created_at).toDateString() !== today) return sum;

      const profit =
        (Number(item.selling_price || 0) - Number(item.cost_price || 0)) *
        Number(item.quantity || 0);

      return sum + profit;
    }, 0);

    setTodayProfit(total);
  }

  function fetchDashboardData() {
    setLoading(true);

    setTimeout(() => {
      fetchTotalSales();
      fetchTransactions();
      fetchTodayProfit();
      fetchBestSellers();
      fetchRevenue();
      fetchProfitChart();
      fetchRecentSales();
      fetchLowStock();

      setLoading(false);
    }, 0);
  }

  function fetchTotalSales() {
    const total = sampleSales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );

    setTotalSales(total);
  }

  function fetchTransactions() {
    const today = new Date().toDateString();

    const count = sampleSales.filter(
      (sale) => new Date(sale.created_at).toDateString() === today,
    ).length;

    setTransactions(count);
  }

  function fetchLowStock() {
    const low = sampleProducts.filter(
      (product) => product.stock <= product.min_stock,
    );

    setLowStock(low);
  }

  function fetchRecentSales() {
    const today = new Date().toDateString();

    const recent = sampleSales
      .filter((sale) => new Date(sale.created_at).toDateString() === today)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setRecentSales(recent);
  }

  function fetchRevenue() {
    const data = sampleSales;

    const today = new Date();
    let grouped = {};

    if (revenuePeriod === "week") {
      const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      // initialize all days
      week.forEach((d) => (grouped[d] = 0));

      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());

      data.forEach((sale) => {
        const date = new Date(sale.created_at);

        if (date >= start) {
          const key = week[date.getDay()];
          grouped[key] += Number(sale.total);
        }
      });
    }

    if (revenuePeriod === "month") {
      const today = new Date();

      const daysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      ).getDate();

      // Initialize every day to 0
      for (let i = 1; i <= daysInMonth; i++) {
        grouped[i] = 0;
      }

      data.forEach((sale) => {
        const date = new Date(sale.created_at);

        // Only include sales from the current month
        if (
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        ) {
          grouped[date.getDate()] += Number(sale.total || 0);
        }
      });
    }

    if (revenuePeriod === "year") {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      months.forEach((m) => (grouped[m] = 0));

      data.forEach((sale) => {
        const date = new Date(sale.created_at);

        if (date.getFullYear() === today.getFullYear()) {
          grouped[months[date.getMonth()]] += Number(sale.total);
        }
      });
    }

    setChartData(
      Object.keys(grouped).map((key) => ({
        name: key,
        revenue: grouped[key],
      })),
    );
  }

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();

      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // next 12:00 AM

      const diff = midnight - now;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeProducts = useMemo(() => {
    return sampleProducts.filter((p) => !p.deleted);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [saleItems, sales]);

  useEffect(() => {
    fetchRevenue();
  }, [revenuePeriod]);

  useEffect(() => {
    fetchProfitChart();
  }, [profitPeriod]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="">Sales and transactions overview</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card
          title="Total Revenue"
          value={`₱ ${totalSales.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
          action={{
            label: "View Sales Report",
            onClick: () => navigate("/app/sales"),
          }}
        />

        <Card
          title="Today's Profit"
          value={`₱ ${todayProfit.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={DollarSign}
          color="green"
          action={{
            label: "Based on today's sales",
          }}
        />

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          {/* glow background */}
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-100 opacity-40 blur-2xl group-hover:scale-125 transition-all" />
          <div className="relative flex items-center justify-between">
            {/* text */}
            <div>
              <p className="text-sm uppercase tracking-wide font-medium text-gray-500">
                Today's Transactions
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {transactions}
              </h2>
              <span className="mt-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                Resets in {timeLeft}
              </span>
            </div>
            {/* icon */}
            <div className="flex -mt-6 h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <ShoppingCart className="text-white" size={28} />
            </div>
          </div>
          {/* bottom line */}
          <div className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-700 transition-all duration-300 group-hover:w-full" />
        </div>

        <Card
          title="Low Stock"
          value={lowStock.length}
          icon={AlertTriangle}
          color="red"
          action={{
            label: "View Inventory",
            onClick: () => navigate("/app/products"),
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* REVENUE CHART */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-4 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-lg">Revenue Overview</h2>

              <p className="text-xs text-gray-500">
                Revenue by {revenuePeriod}
              </p>
            </div>

            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: -9,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis tickFormatter={(value) => `₱${value}`} />

                <Tooltip
                  formatter={(value) => [
                    `₱${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ea580c"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit CHART */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-4 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-lg">Profit Overview</h2>

              <p className="text-xs text-gray-500">Profit by {profitPeriod}</p>
            </div>

            <div className="flex text-sm justify-end mb-6">
              <select
                value={profitPeriod}
                onChange={(e) => setProfitPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={profitChartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: -9,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis tickFormatter={(value) => `₱${value}`} />

                <Tooltip
                  formatter={(value) => [
                    `₱${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    "Profit",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-auto">
        {/* TODAY'S TRANSACTIONS */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-5 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-semibold text-lg">Today's Transactions</h2>
              <p className="text-sm text-gray-500">Latest sales today</p>
            </div>

            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              {recentSales.length} Sales
            </span>
          </div>

          {recentSales.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No transactions today</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {recentSales.map((sale, index) => (
                <div
                  key={sale.id}
                  className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        #{String(recentSales.length - index).padStart(4, "0")}
                      </p>

                      <p className="text-xs text-gray-500">
                        {new Date(sale.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ₱{Number(sale.total).toFixed(2)}
                      </p>

                      <p className="text-xs text-gray-500">
                        Profit ₱{getProfit(sale).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BEST SELLING PRODUCTS */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-5 h-[400px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Items Sold Today
              </h2>
              <p className="text-sm text-gray-500">Ranked by quantity sold</p>
            </div>

            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              {bestSellers.length} Items
            </span>
          </div>

          {bestSellers.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-gray-500">No sales recorded today.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {bestSellers.map((product, index) => {
                const highest = bestSellers[0]?.quantity || 1;
                const percent = (product.quantity / highest) * 100;

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-4 hover:bg-gray-50 transition px-2 rounded-lg"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {product.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {product.quantity} sold
                        </p>

                        <div className="mt-2 h-1.5 w-36 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ₱
                        {Number(product.revenue).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
