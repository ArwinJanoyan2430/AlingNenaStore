import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
} from "lucide-react";

import Card from "../components/Card";
import { supabase } from '../services/supabase';
import lowStock from "../sampleData/lowStock";

const Dashboard = () => {
  const [revenue, setRevenue] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [products, setProducts] = useState(0);

  useEffect(() => {
    fetchRevenue();
    fetchTransactions();
    fetchProducts();
    fetchLowStock();
  }, []);

  async function fetchRevenue() {
    const { data, error } = await supabase
      .from("sales")
      .select("total");

    if (!error) {
      const totalRevenue = data.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      );

      setRevenue(totalRevenue);
    }
  }

  async function fetchTransactions() {
    const { count, error } = await supabase
      .from("sales")
      .select("*", { count: "exact", head: true });

    if (!error) {
      setTransactions(count);
    }
  }

  async function fetchProducts() {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (!error) {
      setProducts(count);
    }
  }

  async function fetchLowStock() {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock")
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(5);

    if (!error) {
      setLowStock(data);
    }
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

      {/* Statistics */}
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

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="text-orange-700"
                size={20}
              />

              <h2 className="font-semibold text-slate-900">
                Low Stock Items
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              Top 5
            </span>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No low stock products 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-1 last:border-none"
                >
                  <p className="font-normal text-xs text-slate-800">
                    {product.name}
                  </p>

                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placeholder for another widget */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-center">
          <p className="text-slate-400">
            Recent Transactions (Coming Soon)
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;