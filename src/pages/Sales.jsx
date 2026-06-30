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
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
          <DollarSign className="text-green-600" />
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h2 className="text-xl font-bold">
              ₱{totalRevenue.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
          <Receipt className="text-blue-600" />
          <div>
            <p className="text-gray-500 text-sm">Transactions</p>
            <h2 className="text-xl font-bold">{sales.length}</h2>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
          <Calendar className="text-orange-600" />
          <div>
            <p className="text-gray-500 text-sm">Latest Sale</p>
            <h2 className="text-sm font-bold">
              {sales[0]?.created_at
                ? new Date(sales[0].created_at).toLocaleString()
                : "No sales yet"}
            </h2>
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
              sales.map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="p-4 text-xs text-gray-600">
                    {sale.id}
                  </td>

                  <td className="p-4 font-bold text-green-600">
                    ₱{Number(sale.total).toFixed(2)}
                  </td>

                  <td className="p-4">
                    ₱{Number(sale.cash).toFixed(2)}
                  </td>

                  <td className="p-4">
                    ₱{Number(sale.change).toFixed(2)}
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