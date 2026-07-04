import { useEffect, useState, useMemo } from "react";
import { DollarSign, Calendar, Receipt, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { sampleSales } from "../data/sampleSales";
import { sampleSaleItems } from "../data/sampleSaleItems";
import { sampleProducts } from "../data/sampleProducts";
import { sampleReports } from "../data/sampleReports";

export default function Sales() {
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [sales, setSales] = useState(sampleSales);
  const [saleItems, setSaleItems] = useState(sampleSaleItems);

  function fetchReports() {
    setReports(sampleReports);
  }

  useEffect(() => {
  setSales(sampleSales);
  setSaleItems(sampleSaleItems);
  setLoading(false);
}, []);

  const totalProfit = useMemo(() => {
    return saleItems.reduce((sum, item) => {
      return (
        sum +
        (Number(item.selling_price) - Number(item.cost_price)) *
          Number(item.quantity)
      );
    }, 0);
  }, [saleItems]);

  useEffect(() => {
    async function loadData() {
      await Promise.all([fetchSales(), fetchTotalProfit(), fetchReports()]);
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

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  function fetchSales() {
    setLoading(true);

    const salesWithItems = sampleSales.map((sale) => {
      const sale_items = sampleSaleItems
        .filter((item) => item.sale_id === sale.id)
        .map((item) => ({
          ...item,
          product: sampleProducts.find((p) => p.id === item.product_id),
        }));

      const profit = sale_items.reduce((sum, item) => {
        return sum + (item.selling_price - item.cost_price) * item.quantity;
      }, 0);

      return {
        ...sale,
        sale_items,
        profit,
      };
    });

    setSales(salesWithItems);
    setLoading(false);
  }

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  async function confirmDelete() {
    if (!deleteId || deleting) return;

    setDeleting(true);

    try {
      setSales((prev) => prev.filter((sale) => sale.id !== deleteId));

      setSaleItems((prev) => prev.filter((item) => item.sale_id !== deleteId));

      toast.success("Transaction deleted permanently");
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setShowDelete(false);
      setShowFinalConfirm(false);
      setDeleteMode(null);
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
        <p className="">Transaction history and revenue tracking</p>
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

              <p className="mt-2 text-xs text-gray-400">All-time earnings</p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <DollarSign className="text-white" size={30} />
            </div>
          </div>

          <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-700 transition-all duration-300 group-hover:w-full" />
        </div>

        {/* Total Profit */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-100 opacity-40 blur-2xl group-hover:scale-125 transition-all" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide font-medium text-gray-500">
                Total Profit
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-600">
                ₱
                {totalProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>

              <p className="mt-2 text-xs text-gray-400">Lifetime profit</p>
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

              <span className="mt-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                Resets in {timeLeft}
              </span>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Receipt className="text-white" size={30} />
            </div>
          </div>

          <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-700 transition-all duration-300 group-hover:w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ================= SALES TABLE ================= */}
        <div className="xl:col-span-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm w-full">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Sales Transactions
            </h2>
            <p className="text-sm text-gray-500">
              Complete history of all recorded sales.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px] max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                  <tr className="text-sm uppercase tracking-wider text-gray-700">
                    <th className="px-4 py-4 text-left whitespace-nowrap">
                      Sale ID
                    </th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">
                      Revenue
                    </th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">
                      Profit
                    </th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">
                      Cash
                    </th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">
                      Change
                    </th>
                    <th className="px-4 py-4 text-center whitespace-nowrap">
                      Transaction
                    </th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-4 py-4 text-center whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {sales.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-gray-500"
                      >
                        No sales found.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale, index) => (
                      <tr key={sale.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 font-semibold whitespace-nowrap">
                          #{String(sales.length - index).padStart(4, "0")}
                        </td>

                        <td className="px-4 py-4 text-right font-semibold text-green-600 whitespace-nowrap">
                          ₱{Number(sale.total).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-right font-semibold text-emerald-600 whitespace-nowrap">
                          ₱{Number(sale.profit).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          ₱{Number(sale.payment).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          ₱{Number(sale.change).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600"
                          >
                            View
                          </button>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(sale.created_at).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => {
                              setDeleteId(sale.id);
                              setShowDelete(true);
                            }}
                            className="rounded-lg border border-gray-300 p-2 text-red-500 hover:bg-red-100 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= CSV ARCHIVE ================= */}
        <div className="w-full h-[55vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col">
          <div className="border-b border-gray-200 px-4 sm:px-5 py-4">
            <h2 className="text-lg font-semibold">Weekly CSV Reports</h2>

            <p className="text-sm text-gray-500">
              Automatically generated every Sunday.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {reports.length === 0 ? (
              <div className="flex h-full items-center justify-center p-10 text-gray-500">
                No reports generated yet.
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="border-b p-4 sm:p-5 hover:bg-gray-50"
                >
                  {/* Header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-base">
                        Week {report.week_number}
                      </h3>

                      <p className="text-xs text-gray-500">
                        {new Date(report.generated_at).toLocaleDateString()}
                      </p>
                    </div>

                    <a
                      href={report.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                      Download CSV
                    </a>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="text-gray-500">Revenue</p>

                      <p className="font-bold text-green-600">
                        ₱{Number(report.total_revenue).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="text-gray-500">Profit</p>

                      <p className="font-bold text-emerald-600">
                        ₱{Number(report.total_profit).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-gray-500">Transactions</p>

                      <p className="font-bold text-gray-800">
                        {report.total_transactions}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {showDelete && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => {
            setShowDelete(false);
            setDeleteId(null);
            setDeleteMode(null);
          }}
        >
          <div
            className="w-[92%] max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top danger bar */}
            <div className="h-2 bg-red-500" />

            {/* Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <h2 className="text-lg font-semibold text-red-700">
                Delete Transaction
              </h2>
              <p className="text-sm text-red-500 mt-1">
                Choose what you want to delete
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Choice Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setDeleteMode("transaction")}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    deleteMode === "transaction"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-gray-800">
                    Delete transaction only
                  </p>
                  <p className="text-sm text-gray-500">
                    Keeps product/item history, removes sale record only
                  </p>
                </button>

                <button
                  onClick={() => setDeleteMode("all")}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    deleteMode === "all"
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-red-700">
                    Delete transaction + profit data
                  </p>
                  <p className="text-sm text-gray-500">
                    Removes sale + all related items (affects profit)
                  </p>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-100 border-gray-200 flex justify-center gap-2">
              <button
                onClick={() => {
                  setShowDelete(false);
                  setDeleteId(null);
                  setDeleteMode(null);
                }}
                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!deleteMode) return;

                  setShowDelete(false);
                  setShowFinalConfirm(true);
                }}
                disabled={!deleteMode}
                className="flex-1 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMode ? "Continue" : "Select an option"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showFinalConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
          onClick={() => setShowFinalConfirm(false)}
        >
          <div
            className="w-[92%] max-w-sm rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center  bg-red-600 px-6 py-2 rounded-t-2xl" />

            <div className="border-b px-6 py-5">
              <h2 className="text-xl font-semibold text-red-600">
                Final Confirmation
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {deleteMode === "all"
                  ? "This will permanently delete the transaction and all related profit records. This action cannot be undone."
                  : "This will permanently delete the transaction. This action cannot be undone."}
              </p>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4">
              <button
                onClick={() => {
                  setShowFinalConfirm(false);
                  setShowDelete(true);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await confirmDelete(deleteMode === "all");

                  setShowFinalConfirm(false);
                  setDeleteId(null);
                  setDeleteMode(null);
                }}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 "
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="w-[95%] max-w-md rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl -mt-1 bg-orange-600 border-b px-5 py-4">
              <div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Transaction #
                    {String(
                      sales.length - sales.indexOf(selectedSale),
                    ).padStart(4, "0")}
                  </h2>

                  <p className="text-sm text-white">
                    {new Date(selectedSale.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSale(null)}
                className="rounded-md px-2 py-1 text-white hover:bg-orange-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Products */}
            <div className="max-h-80 overflow-y-auto p-5">
              {selectedSale.sale_items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.products?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-orange-600">
                    ₱
                    {(
                      Number(item.selling_price) * Number(item.quantity)
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-5 py-4">
              <button
                onClick={() => setSelectedSale(null)}
                className="w-full rounded-lg bg-orange-500 py-2.5 font-medium text-white hover:bg-orange-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
