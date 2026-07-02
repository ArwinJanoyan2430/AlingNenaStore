import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
} from "lucide-react";

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
import { supabase } from "../services/supabase";

const Dashboard = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [chartData, setChartData] = useState([]);
const [revenuePeriod, setRevenuePeriod] = useState("week");
const [profitPeriod, setProfitPeriod] = useState("week");
  const [totalSales, setTotalSales] = useState(0);
  const [transactions, setTransactions] = useState(0);

  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [profitChartData, setProfitChartData] = useState([]);
  const [loading, setLoading] = useState(true);

async function fetchBestSellers() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const { data, error } = await supabase
    .from("sale_items")
    .select(`
      quantity,
      selling_price,
      product_id,
      products!sale_items_product_id_fkey (
        id,
        name
      )
    `)
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString());

  if (error) {
    console.error(error);
    return;
  }

  const grouped = {};

  data.forEach((item) => {
    const id = item.product_id;
    const name = item.products?.name ?? "Unknown Product";

    if (!grouped[id]) {
      grouped[id] = {
        id,
        name,
        quantity: 0,
        revenue: 0,
      };
    }

    grouped[id].quantity += Number(item.quantity);

    grouped[id].revenue +=
      Number(item.quantity) *
      Number(item.selling_price);
  });

  const top5 = Object.values(grouped)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  setBestSellers(top5);
}
  
  async function fetchProfitChart() {
const { data, error } = await supabase
  .from("sale_items")
  .select("quantity, selling_price, cost_price, created_at");

if (error) {
  console.error(error);
  return;
}

if (!data || data.length === 0) {
  setProfitChartData([]);
  return;
}

  const today = new Date();
  let grouped = {};

  if (profitPeriod  === "week") {
    const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    week.forEach(day => grouped[day] = 0);

    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    start.setHours(0,0,0,0);

    data.forEach(item => {
      if (!item.created_at) return;

      const date = new Date(item.created_at);

      if (date >= start) {
      const profit =
        ((Number(item.selling_price) || 0) -
          (Number(item.cost_price) || 0)) *
        (Number(item.quantity) || 0);

        grouped[week[date.getDay()]] += profit;
      }
    });
  }

  if (profitPeriod  === "month") {
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      grouped[i] = 0;
    }

    data.forEach(item => {
      if (!item.created_at) return;

      const date = new Date(item.created_at);

      if (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
const profit =
  ((Number(item.selling_price) || 0) -
    (Number(item.cost_price) || 0)) *
  (Number(item.quantity) || 0);

        grouped[date.getDate()] += profit;
      }
    });
  }

  if (profitPeriod  === "year") {
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    months.forEach(month => grouped[month] = 0);

    data.forEach(item => {
      if (!item.created_at) return;

      const date = new Date(item.created_at);

      if (date.getFullYear() === today.getFullYear()) {
const profit =
  ((Number(item.selling_price) || 0) -
    (Number(item.cost_price) || 0)) *
  (Number(item.quantity) || 0);

        grouped[months[date.getMonth()]] += profit;
      }
    });
  }

  setProfitChartData(
    Object.keys(grouped).map(key => ({
      name: key,
      profit: grouped[key],
    }))
  );
}

const [todayProfit, setTodayProfit] = useState(0);

async function fetchTodayProfit() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const { data, error } = await supabase
    .from("sale_items")
    .select("quantity, selling_price, cost_price")
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString());

  if (error) {
    console.error(error);
    return;
  }

  const total = (data ?? []).reduce((sum, item) => {
    return (
      sum +
      ((Number(item.selling_price) || 0) -
        (Number(item.cost_price) || 0)) *
      (Number(item.quantity) || 0)
    );
  }, 0);

  setTodayProfit(total);
}

async function fetchDashboardData() {
  try {
    setLoading(true);

    await Promise.all([
      fetchTotalSales(),
      fetchTransactions(),
      fetchLowStock(),
      fetchTodayProfit(),
      fetchBestSellers(),
      fetchRevenue(),
      fetchProfitChart(),
    ]);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

  // =======================
  // TOTAL SALES
  // =======================
  async function fetchTotalSales() {
    const { data, error } = await supabase
      .from("sales")
      .select("total");

    if (error) {
      console.error(error);
      return;
    }

    const total =
      data?.reduce(
        (sum, sale) => sum + Number(sale.total || 0),
        0
      ) || 0;

    setTotalSales(total);
  }


async function fetchTransactions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("sales")
    .select("*", {
      count: "exact",
      head: true,
    })
    .gte("created_at", today.toISOString());

  if (!error) {
    setTransactions(count || 0);
  }
}

  async function fetchLowStock() {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock")
      .lte("stock", 5)
      .order("stock", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      return;
    }

    setLowStock(data || []);
  }

  // =======================
  // RECENT SALES
  // =======================
  async function fetchRecentSales() {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (error) {
      console.error(error);
      return;
    }

    setRecentSales(data || []);
  }

async function fetchRevenue() {
  const { data, error } = await supabase
    .from("sales")
    .select("total, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

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

if (revenuePeriod   === "month") {
  const today = new Date();

  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
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

  if (revenuePeriod  === "year") {
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
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
    }))
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

    setTimeLeft(
      `${hours}h ${minutes}m ${seconds}s`
    );
  };

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  fetchDashboardData();
}, []);

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
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="">
          Sales and transactions overview
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <Card
          title="Total Sales"
          value={`₱ ${totalSales.toLocaleString()}`}
          icon={DollarSign}
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
  <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-700 transition-all duration-300 group-hover:w-full" />
</div>

        <Card
          title="Low Stock"
          value={lowStock.length}
          icon={AlertTriangle}
        />

      <Card
        title="Today's Profit"
        value={`₱ ${todayProfit.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`}
        icon={DollarSign}
      />

      </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

      {/* REVENUE CHART */}
<div className="bg-white rounded-xl shadow-lg border border-gray-300 p-4 w-full">

  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">

    <div>
      <h2 className="font-semibold text-lg">
        Revenue Overview
      </h2>

      <p className="text-xs text-gray-500">
        Revenue by {revenuePeriod}
      </p>
    </div>

    <select
      value={revenuePeriod}
      onChange={(e) => setRevenuePeriod(e.target.value)}
      className="border rounded-lg px-3 py-2 text-sm"
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

        <YAxis  tickFormatter={(value) => `₱${value}`}/>

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
    <h2 className="font-semibold text-lg">
      Profit Overview
    </h2>

    <p className="text-xs text-gray-500">
      Profit by {profitPeriod}
    </p>
    </div>

<div className="flex text-sm justify-end mb-6">
  <select
    value={profitPeriod}
    onChange={(e) => setProfitPeriod(e.target.value)}
    className="border rounded-lg px-3 py-2"
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

        <YAxis  tickFormatter={(value) => `₱${value}`}/>

      <Tooltip
        formatter={(value) => [
          `₱${Number(value).toLocaleString(undefined,{
            minimumFractionDigits:2,
            maximumFractionDigits:2,
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

        {/* LOW STOCK */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-5 h-[500px] flex flex-col">

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle
                size={20}
                className="text-orange-600"
              />

              <h2 className="font-semibold">
                Low Stock Items
              </h2>
            </div>

            <span className="text-sm text-gray-500">
              {lowStock.length} item{lowStock.length !== 1 ? "s" : ""}
            </span>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No low stock products!
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">

              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      Product ID: {item.id}
                    </p>
                  </div>

                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.stock} left
                  </span>
                </div>
              ))}

            </div>
          )}

        </div>

{/* BEST SELLING PRODUCTS */}
<div className="bg-white rounded-xl shadow-lg border border-gray-300 p-5 h-[500px] flex flex-col">

  <div className="flex justify-between items-center mb-5">
    <div>
      <h2 className="font-semibold text-lg">
        Best Selling Products
      </h2>

      <p className="text-sm text-gray-500">
        Top 5 products today
      </p>
    </div>

    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
      🔥 Top Sellers
    </span>
  </div>

  {bestSellers.length === 0 ? (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400">
        No sales yet today
      </p>
    </div>
  ) : (
    <div className="flex-1 overflow-y-auto space-y-4 pr-2">

      {bestSellers.map((product, index) => {
        const highest = bestSellers[0]?.quantity || 1;
        const percent = (product.quantity / highest) * 100;

        return (
          <div
            key={product.id}
            className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">

              <div className="flex items-center gap-3">

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : index === 1
                      ? "bg-gray-200 text-gray-700"
                      : index === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  #{index + 1}
                </div>

                <div>
                  <p className="font-semibold">
                    {product.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {product.quantity} sold
                  </p>
                </div>

              </div>

              <div className="text-right">
                <p className="font-bold text-green-600">
                  ₱{Number(product.revenue).toLocaleString()}
                </p>

                <p className="text-xs text-gray-400">
                  Revenue
                </p>
              </div>

            </div>

            <div className="mt-4">
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-600"
                  style={{
                    width: `${percent}%`,
                  }}
                />
              </div>
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