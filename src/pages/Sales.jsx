import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { DollarSign, Calendar, Receipt, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Sales() {
  const [totalProfit, setTotalProfit] = useState(0);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
async function fetchTotalProfit() {
  const { data, error } = await supabase
    .from("sale_items")
    .select("quantity, selling_price, cost_price");

  if (error) {
    console.error(error);
    return;
  }

  const profit = (data ?? []).reduce((sum, item) => {
    return (
      sum +
      ((Number(item.selling_price) || 0) -
        (Number(item.cost_price) || 0)) *
      (Number(item.quantity) || 0)
    );
  }, 0);

  setTotalProfit(profit);
}

useEffect(() => {
  async function loadData() {
    await Promise.all([
      fetchSales(),
      fetchTotalProfit(),
    ]);
  }

  loadData();
}, []);
  
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

async function fetchSales() {
  setLoading(true);

  const { data, error } = await supabase
    .from("sales")
    .select(`
      *,
      sale_items (
        quantity,
        selling_price,
        cost_price
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Sales fetch error:", error.message);
    setLoading(false);
    return;
  }

  const salesWithProfit = (data || []).map((sale) => {
    const profit = (sale.sale_items || []).reduce((total, item) => {
      const sellingPrice = Number(item.selling_price) || 0;
      const costPrice = Number(item.cost_price) || 0;
      const quantity = Number(item.quantity) || 0;

      return total + (sellingPrice - costPrice) * quantity;
    }, 0);

    return {
      ...sale,
      profit,
    };
  });

  setSales(salesWithProfit);
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

async function confirmDelete(deleteEverything) {
  if (!deleteId) return;

  setDeleting(true);

  try {
    // Delete sale items (profit) if user chose "Delete Everything"
    if (deleteEverything) {
      const { error: itemError } = await supabase
        .from("sale_items")
        .delete()
        .eq("sale_id", deleteId);

      if (itemError) throw itemError;
    }

    // Delete the sale
    const { error: saleError } = await supabase
      .from("sales")
      .delete()
      .eq("id", deleteId);

    if (saleError) throw saleError;

    // Refresh data
    await Promise.all([
      fetchSales(),
      fetchTotalProfit(),
    ]);

    // Reset modal
    setDeleteId(null);
    setShowDelete(false);
    setShowFinalConfirm(false);
    setDeleteMode(null);

    toast.success("Transaction deleted successfully.");
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Failed to delete transaction.");
  } finally {
    setDeleting(false);
  }
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
          Resets in {timeLeft}
        </span>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
        <Receipt className="text-white" size={30} />
      </div>
    </div>

    <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-700 transition-all duration-300 group-hover:w-full" />

  </div>

{/* Total Profit */}
<div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-100 opacity-40 blur-2xl group-hover:scale-125 transition-all" />

  <div className="relative flex items-center justify-between">
    <div>
      <p className="text-sm uppercase tracking-wide font-medium text-gray-500">
        Total Profit
      </p>

      <h2 className="mt-2 text-3xl font-bold text-gray-900">
        ₱{totalProfit.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </h2>

      <p className="mt-2 text-xs text-gray-400">
        Lifetime profit
      </p>
    </div>

    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
      <DollarSign className="text-white" size={30} />
    </div>
  </div>

  <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-700 transition-all duration-300 group-hover:w-full" />

</div>

</div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Profit</th>
              <th className="text-left p-4">Cash</th>
              <th className="text-left p-4">Change</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-5 text-center text-gray-500">
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

                <td className="p-4 font-semibold text-emerald-600">
                  ₱{sale.profit.toLocaleString(undefined, {
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
      {/* CONFIRMATION MODAL */}
{showDelete && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    {/* STEP 1 */}
    {!showFinalConfirm && (
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md">

        <h2 className="text-xl font-bold">
          Delete Transaction
        </h2>

        <p className="text-gray-500 mt-2">
          What would you like to delete?
        </p>

        <div className="space-y-3 mt-6">

          <button
            onClick={() => {
              setDeleteMode("all");
              setShowFinalConfirm(true);
            }}
            className="w-full rounded-lg bg-red-600 text-white py-3 hover:bg-red-700"
          >
            Delete Everything
            <p className="text-xs text-red-100 mt-1">
              Removes the sale and all sale items.
            </p>
          </button>

          <button
            onClick={() => {
              setDeleteMode("keep");
              setShowFinalConfirm(true);
            }}
            className="w-full rounded-lg border border-orange-300 bg-orange-50 text-orange-700 py-3 hover:bg-orange-100"
          >
            Keep Profit Record
            <p className="text-xs mt-1">
              Deletes only the sale. Sale items remain for profit reports.
            </p>
          </button>

          <button
          onClick={() => {
            setShowDelete(false);
            setDeleteId(null);
            setDeleteMode(null);
            setShowFinalConfirm(false);
          }}
            className="w-full rounded-lg border py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

        </div>
      </div>
    )}

    {/* STEP 2 */}
    {showFinalConfirm && (
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm">

        <h2 className="text-xl font-bold text-red-600">
          Are you sure?
        </h2>

        <p className="text-gray-500 mt-2">
          {deleteMode === "all"
            ? "This will permanently delete the transaction and all profit records. This action cannot be undone."
            : "This will delete only the transaction. Profit records will remain."}
        </p>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={() => {
              setShowFinalConfirm(false);
              setDeleteMode(null);
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Back
          </button>

        <button
          disabled={deleting}
          onClick={() => confirmDelete(deleteMode === "all")}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? "Deleting..." : "Yes, Delete"}
        </button>

        </div>

      </div>
    )}

  </div>
)}
    </div>
  );
}