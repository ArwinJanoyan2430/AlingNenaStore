import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { DollarSign, Calendar, Receipt, Trash2 } from "lucide-react";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Sales fetch error:", error.message);
    } else {
      setSales(data);
    }

    setLoading(false);
  }

  const totalRevenue = sales.reduce(
    (sum, s) => sum + Number(s.total || 0),
    0
  );

  if (loading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
    </div>;
  }

   async function confirmDelete() {
    if (!deleteId) return;

    const { error } = await supabase
      .from("sales")
      .delete()
      .eq("id", deleteId);

    if (error) {
      console.error(error.message);
      alert("Failed to delete");
    } else {
      setSales((prev) => prev.filter((s) => s.id !== deleteId));
    }

    setDeleteId(null);
    setShowDelete(false);
  }

const today = new Date();

const todaysTransactions = sales.filter((sale) => {
  const saleDate = new Date(sale.created_at);

  return (
    saleDate.getDate() === today.getDate() &&
    saleDate.getMonth() === today.getMonth() &&
    saleDate.getFullYear() === today.getFullYear()
  );
}).length;
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="mb-6 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Sales Report</h1>
        <p className="">
          Transaction history and revenue tracking
        </p>
      </div>

      {/* Summary Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

  {/* Total Revenue */}
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-100 opacity-40 blur-2xl group-hover:scale-125 transition-all" />

    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide font-medium text-gray-500">
          Total Revenue
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          ₱{totalRevenue.toLocaleString()}
        </h2>

        <p className="mt-2 text-xs text-gray-400">
          All-time earnings
        </p>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
        <DollarSign className="text-white" size={30} />
      </div>
    </div>

    <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-700 transition-all duration-300 group-hover:w-full" />

  </div>

  {/* Transactions */}
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-100 opacity-40 blur-2xl group-hover:scale-125 transition-all" />

    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide font-medium text-gray-500">
          Transactions
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          {sales.length}
        </h2>

        <p className="mt-2 text-xs text-gray-400">
          Lifetime transactions
        </p>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
        <Receipt className="text-white" size={30} />
      </div>
    </div>

    <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-700 transition-all duration-300 group-hover:w-full" />

  </div>

  {/* Today's Transactions */}
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-100 opacity-40 blur-2xl group-hover:scale-125 transition-all" />

    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide font-medium text-gray-500">
          Today's Transactions
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          {todaysTransactions}
        </h2>

        <span className="mt-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
          Resets at 12:00 AM
        </span>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
        <Receipt className="text-white" size={30} />
      </div>
    </div>

    <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-700 transition-all duration-300 group-hover:w-full" />

  </div>

  {/* Latest Sale */}
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-purple-100 opacity-40 blur-2xl group-hover:scale-125 transition-all" />

    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide font-medium text-gray-500">
          Latest Sale
        </p>

        <h2 className="mt-2 text-sm font-semibold leading-6 text-gray-900">
          {sales[0]?.created_at
            ? new Date(sales[0].created_at).toLocaleString()
            : "No sales yet"}
        </h2>

        <p className="mt-2 text-xs text-gray-400">
          Most recent transaction
        </p>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
        <Calendar className="text-white" size={30} />
      </div>
    </div>

    <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-purple-500 to-violet-700 transition-all duration-300 group-hover:w-full" />

  </div>

</div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Cash</th>
              <th className="text-left p-4">Change</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  No sales found
                </td>
              </tr>
            ) : (
              sales.map((sale, index) => (
              <tr key={sale.id} className="border-t hover:bg-orange-50 transition">
                <td className="p-4 font-medium">
                  #{String(sales.length - index).padStart(4, "0")}
                </td>

                <td className="p-4 font-bold text-green-600">
                  ₱{Number(sale.total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className="p-4">
                  ₱{Number(sale.payment || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className="p-4">
                  ₱{Number(sale.change || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className="p-4 text-sm text-gray-500">
                  {new Date(sale.created_at).toLocaleString()}
                </td>

                <td className="p-4">
                  <button
                    onClick={() => {
                      setDeleteId(sale.id);
                      setShowDelete(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>

        </table>
      </div>

      {/* CONFIRMATION MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm">

            <h2 className="text-xl font-bold text-gray-800">
              Delete Transaction?
            </h2>

            <p className="text-gray-500 mt-2">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}