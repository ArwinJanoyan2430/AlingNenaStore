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

  const [chartData, setChartData] = useState([]);
const [period, setPeriod] = useState("week");
  const [totalSales, setTotalSales] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [products, setProducts] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  async function fetchDashboardData() {
    await Promise.all([
      fetchTotalSales(),
      fetchTransactions(),
      fetchProducts(),
      fetchLowStock(),
      fetchRecentSales(),
    ]);
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

  // =======================
  // TRANSACTIONS
  // =======================
  async function fetchTransactions() {
    const { count, error } = await supabase
      .from("sales")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (!error) {
      setTransactions(count || 0);
    }
  }

  // =======================
  // PRODUCTS
  // =======================
  async function fetchProducts() {
    const { count, error } = await supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (!error) {
      setProducts(count || 0);
    }
  }

  // =======================
  // LOW STOCK
  // =======================
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

  if (period === "week") {
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

if (period === "month") {
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

  if (period === "year") {
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
  fetchDashboardData();
  fetchRevenue();
}, [period]);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-6">

        <Card
          title="Total Sales"
          value={`₱ ${totalSales.toLocaleString()}`}
          icon={DollarSign}
        />

        <Card
          title="Transactions"
          value={transactions}
          icon={ShoppingCart}
        />

        <Card
          title="Total Products"
          value={products}
          icon={Package}
        />

        <Card
          title="Low Stock"
          value={lowStock.length}
          icon={AlertTriangle}
        />

      </div>

      {/* REVENUE CHART */}
<div className="max-w-6xl mx-auto mb-5 bg-white rounded-xl shadow border p-4">

  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">

    <div>
      <h2 className="font-semibold text-lg">
        Revenue Overview
      </h2>

      <p className="text-xs text-gray-500">
        Revenue by {period}
      </p>
    </div>

    <select
      value={period}
      onChange={(e) => setPeriod(e.target.value)}
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

      {/* BOTTOM WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">

        {/* LOW STOCK */}
        <div className="bg-white rounded-xl shadow-sm border p-5 h-[500px] flex flex-col">

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

        {/* RECENT TRANSACTIONS */}
        <div className="bg-white rounded-xl shadow-sm border p-5 h-[500px] flex flex-col">

          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">
              Recent Transactions
            </h2>

            <span className="text-sm text-gray-500">
              Latest 5
            </span>
          </div>

          {recentSales.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No transactions yet
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">

              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">
                      ₱{Number(sale.total).toLocaleString()}
                    </p>

                    <p className="text-xs text-gray-500">
                      Payment: ₱{Number(sale.payment || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-green-600 font-semibold">
                      Change: ₱{Number(sale.change || 0).toLocaleString()}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(sale.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;