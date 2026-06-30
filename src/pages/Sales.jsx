import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { DollarSign, Calendar, Receipt } from "lucide-react";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

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
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

  {/* Total Revenue */}
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition p-5">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">Total Revenue</p>

        <h2 className="mt-2 text-3xl font-bold text-green-600">
          ₱{totalRevenue.toLocaleString()}
        </h2>

        <p className="mt-1 text-xs text-gray-400">
          All-time earnings
        </p>
      </div>

      <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
        <DollarSign className="text-green-600" size={24} />
      </div>
    </div>
  </div>

  {/* Transactions */}
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition p-5">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">Transactions</p>

        <h2 className="mt-2 text-3xl font-bold text-blue-600">
          {sales.length}
        </h2>

        <p className="mt-1 text-xs text-gray-400">
          Lifetime transactions
        </p>
      </div>

      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
        <Receipt className="text-blue-600" size={24} />
      </div>
    </div>
  </div>

{/* Today's Transactions */}
<div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition p-5">
  <div className="flex justify-between items-start">

    <div>
      <p className="text-sm text-gray-500">
        Today's Transactions
      </p>

      <h2 className="mt-2 text-3xl font-bold text-orange-600">
        {todaysTransactions}
      </h2>

      <span className="inline-flex items-center mt-3 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
        Resets at 12:00 AM
      </span>
    </div>

    <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
      <Receipt className="text-orange-600" size={24} />
    </div>

  </div>
</div>

  {/* Latest Sale */}
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition p-5">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">Latest Sale</p>

        <h2 className="mt-2 text-sm font-semibold text-gray-800 leading-5">
          {sales[0]?.created_at
            ? new Date(sales[0].created_at).toLocaleString()
            : "No sales yet"}
        </h2>

        <p className="mt-2 text-xs text-gray-400">
          Most recent transaction
        </p>
      </div>

      <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
        <Calendar className="text-orange-600" size={24} />
      </div>
    </div>
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
              </tr>
            ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}