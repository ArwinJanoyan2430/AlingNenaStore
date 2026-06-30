import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
} from "lucide-react";

import Card from "../components/Card";
import { supabase } from "../services/supabase";

const Dashboard = () => {
  const [revenue, setRevenue] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [products, setProducts] = useState(0);
  const [lowStock, setLowStock] = useState([]);
 const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    fetchRevenue();
    fetchTransactions();
    fetchProducts();
    fetchLowStock();
    fetchRecentSales()
  }, []);
  async function fetchRecentSales() {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error(error);
    return;
  }

  setRecentSales(data || []);
}
  // Revenue
  async function fetchRevenue() {
    const { data, error } = await supabase
      .from("sales")
      .select("total");

    if (error) {
      console.error(error);
      return;
    }

    const totalRevenue =
      data?.reduce((sum, sale) => sum + Number(sale.total || 0), 0) || 0;

    setRevenue(totalRevenue);
  }

  // Transactions count
  async function fetchTransactions() {
    const { count, error } = await supabase
      .from("sales")
      .select("*", { count: "exact", head: true });

    if (!error) {
      setTransactions(count || 0);
    }
  }

  // Products count
  async function fetchProducts() {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (!error) {
      setProducts(count || 0);
    }
  }

  // Low stock
  async function fetchLowStock() {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock")
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(5);

    if (error) {
      console.error(error);
      return;
    }

    setLowStock(data || []);
  }
  

  return (
    <div className="p-6">

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 p-5 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-slate-900">
          Omboy Store
        </h1>
        <p className="text-slate-600">
          Sales and transactions overview
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-6">

        <Card
          title="Revenue"
          value={`₱ ${revenue.toLocaleString()}`}
          icon={DollarSign}
        />

        <Card
          title="Transactions"
          value={transactions}
          icon={ShoppingCart}
        />

        <Card
          title="Products"
          value={products}
          icon={Package}
        />

        <Card
          title="Low Stock"
          value={lowStock.length}
          icon={AlertTriangle}
        />

      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm border p-5">

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-orange-600" size={20} />
              <h2 className="font-semibold">Low Stock Items</h2>
            </div>
            <span className="text-sm text-gray-500">Top 5</span>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No low stock products 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-1"
                >
                  <span className="text-sm">{item.name}</span>
                  <span className="text-xs text-red-600 font-semibold">
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Placeholder */}
        {/* Recent Transactions */}
<div className="bg-white rounded-xl shadow-sm border p-5">

  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold text-gray-900">
      Recent Transactions
    </h2>
    <span className="text-sm text-gray-500">Latest 5</span>
  </div>

  {recentSales.length === 0 ? (
    <p className="text-gray-500 text-sm">
      No transactions yet
    </p>
  ) : (
    <div className="space-y-3">
      {recentSales.map((sale) => (
        <div
          key={sale.id}
          className="flex justify-between items-center border-b pb-2"
        >
          <div>
            <p className="text-sm font-medium">
              ₱{Number(sale.total).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              Cash: ₱{Number(sale.cash).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-green-600 font-semibold">
              Change: ₱{Number(sale.change).toLocaleString()}
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